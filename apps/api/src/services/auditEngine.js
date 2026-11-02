import { v4 as uuid } from 'uuid';
import { config } from '../config.js';
import {
  CATEGORY_RULES,
  resolveCategoryKey,
  stripHtml,
  extractFieldHints
} from './categoryRules.js';

const SEV = { critica: 'critica', alta: 'alta', media: 'media', baja: 'baja' };

function finding(data) {
  return {
    id: uuid(),
    findingType: data.findingType,
    severity: data.severity,
    title: data.title,
    description: data.description,
    suggestedAction: data.suggestedAction || '',
    field: data.field || '',
    confidenceScore: data.confidence ?? 0.9,
    evidence: data.evidence || [],
    isResolved: false
  };
}

function recommendation(data) {
  return {
    id: uuid(),
    findingId: data.findingId || null,
    recommendationType: data.recommendationType,
    description: data.description,
    suggestedValue: data.suggestedValue || '',
    priority: data.priority,
    confidenceScore: data.confidenceScore ?? 0.85,
    field: data.field || '',
    status: 'pendiente'
  };
}

function buildRecommendedTitle(pub, hints) {
  const parts = [];
  const brand = pub.brand || hints.marca || '';
  const model = pub.model || hints.modelo || '';
  let type = pub.productType || '';
  if (!type && pub.productCategory) {
    type = String(pub.productCategory).split(/[\/|,]/)[0].trim();
    if (type.length > 24) type = '';
  }
  if (brand) parts.push(brand);
  if (model) parts.push(model);
  const joined = parts.join(' ').toLowerCase();
  if (type && !joined.includes(String(type).toLowerCase())) parts.push(type);
  if (hints.capacidad) parts.push(hints.capacidad);
  if (hints.voltaje) parts.push(hints.voltaje);
  let title = parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  if (!title) title = (pub.title || 'Producto').slice(0, 60);
  return title.length > 60 ? title.slice(0, 60).trimEnd() : title;
}

function scoreAndStatus(findings) {
  let score = 100;
  const weights = { critica: 25, alta: 12, media: 6, baja: 2 };
  for (const f of findings) score -= weights[f.severity] || 5;
  score = Math.max(0, Math.min(100, score));
  const hasCritical = findings.some((f) => f.severity === SEV.critica);
  const hasHigh = findings.some((f) => f.severity === SEV.alta);
  let auditStatus = 'lista_para_mercado_libre';
  if (hasCritical || score < 50) auditStatus = 'requiere_correcciones_importantes';
  else if (hasHigh || score < 80) auditStatus = 'requiere_mejoras';
  return { qualityScore: score, auditStatus };
}

/** Sin API key: muestra al cliente cómo se verá el aporte de OpenAI (datos de ejemplo). */
function enrichWithOpenAIDemo(pub, draft) {
  const title = pub.title || 'este producto';
  draft.findings.push(
    finding({
      findingType: 'optimizacion',
      severity: SEV.baja,
      title: '[Demo IA] Ángulo de búsqueda en Mercado Libre',
      description: `Con OpenAI real se sugeriría cómo reformular “${String(title).slice(0, 40)}…” según búsquedas típicas en México (sin inventar specs).`,
      suggestedAction: 'Pega OPENAI_API_KEY en el .env y re-audita para sustituir este demo por IA real.',
      field: 'title',
      confidence: 0.55,
      evidence: ['openai-demo']
    })
  );
  draft.recommendations.push(
    recommendation({
      recommendationType: 'optimizacion',
      description:
        '[Demo IA] Priorizar beneficios verificables en los primeros 80 caracteres de la descripción (envío, compatibilidad, garantía) cuando exista la key de OpenAI.',
      priority: 3,
      confidenceScore: 0.55,
      field: 'description'
    })
  );
  draft.descriptionReview.aclarar.push(
    '[Demo IA] Aclarar garantía / política de cambios con redacción orientada a comprador ML (ejemplo; la IA real usará solo datos de la publicación).'
  );
  draft.potentialBuyerQuestions.push({
    question: '[Demo IA] ¿La publicación menciona si el envío es gratis a todo México?',
    clarificationNeeded: 'Ejemplo de pregunta que la IA añadiría según categoría y texto.'
  });
  draft.engine = 'rules+openai-demo';
  return draft;
}

async function enrichWithOpenAI(pub, draft) {
  if (!config.openaiApiKey) return enrichWithOpenAIDemo(pub, draft);
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.openaiModel,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Auditor Shopify→ML (México). JSON keys: recommendedTitle(<=60), extraFindings[], extraRecommendations[], descriptionReview{corregir,eliminar,aclarar,agregar}, potentialQuestions[]. No inventes datos.'
          },
          {
            role: 'user',
            content: JSON.stringify({
              product: {
                title: pub.title,
                description: stripHtml(pub.description || '').slice(0, 4000),
                brand: pub.brand,
                model: pub.model,
                category: pub.productCategory,
                specs: pub.specifications,
                imagesCount: (pub.images || []).length
              },
              draftTitle: draft.recommendedTitle
            })
          }
        ]
      })
    });
    if (!res.ok) return draft;
    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    if (parsed.recommendedTitle && String(parsed.recommendedTitle).length <= 60) {
      draft.recommendedTitle = String(parsed.recommendedTitle);
    }
    for (const ef of parsed.extraFindings || []) {
      draft.findings.push(
        finding({
          findingType: ef.findingType || 'riesgo',
          severity: ef.severity || SEV.media,
          title: ef.title || 'Hallazgo IA',
          description: ef.description || '',
          suggestedAction: ef.suggestedAction || '',
          field: ef.field || '',
          confidence: ef.confidenceScore ?? 0.7,
          evidence: ['openai']
        })
      );
    }
    for (const er of parsed.extraRecommendations || []) {
      draft.recommendations.push(
        recommendation({
          recommendationType: er.recommendationType || 'optimizacion',
          description: er.description || '',
          suggestedValue: er.suggestedValue || '',
          priority: er.priority || 4,
          confidenceScore: er.confidenceScore ?? 0.7,
          field: er.field || ''
        })
      );
    }
    if (parsed.descriptionReview) {
      for (const k of ['corregir', 'eliminar', 'aclarar', 'agregar']) {
        if (Array.isArray(parsed.descriptionReview[k])) {
          draft.descriptionReview[k].push(...parsed.descriptionReview[k]);
        }
      }
    }
    if (Array.isArray(parsed.potentialQuestions)) {
      draft.potentialBuyerQuestions.push(...parsed.potentialQuestions);
    }
    const rescored = scoreAndStatus(draft.findings);
    draft.qualityScore = rescored.qualityScore;
    draft.auditStatus = rescored.auditStatus;
    draft.engine = 'rules+openai';
  } catch {
    /* conserva reglas; si falló la API, deja demo para no perder la idea en demos */
    return enrichWithOpenAIDemo(pub, draft);
  }
  return draft;
}

export async function runAudit(publication) {
  const pub = publication;
  const findings = [];
  const recommendations = [];
  const missingInformation = [];
  const potentialBuyerQuestions = [];
  const descriptionReview = { corregir: [], eliminar: [], aclarar: [], agregar: [] };

  const categoryKey = resolveCategoryKey(pub.productCategory || pub.productType || '');
  const desc = stripHtml(pub.description || '');
  const titleHints = extractFieldHints(pub.title || '');
  const hints = { ...extractFieldHints(desc), ...extractFieldHints(JSON.stringify(pub.specifications || {})) };
  const title = pub.title || '';

  if (!title) {
    findings.push(
      finding({
        findingType: 'omision',
        severity: SEV.critica,
        title: 'Título vacío',
        description: 'La publicación no tiene título.',
        suggestedAction: 'Agregar título claro (máx. 60).',
        field: 'title',
        confidence: 1
      })
    );
  } else if (title.length > 60) {
    const f = finding({
      findingType: 'error',
      severity: SEV.alta,
      title: `Título excede 60 caracteres (${title.length})`,
      description: `Actual: ${title.length} caracteres.`,
      suggestedAction: 'Acortar a máximo 60.',
      field: 'title',
      confidence: 1,
      evidence: [`longitud=${title.length}`]
    });
    findings.push(f);
    recommendations.push(
      recommendation({
        recommendationType: 'correccion',
        description: 'Reducir el título a máximo 60 caracteres.',
        priority: 1,
        findingId: f.id,
        field: 'title',
        confidenceScore: 1
      })
    );
  }

  if (desc.length < 40) {
    const f = finding({
      findingType: 'omision',
      severity: SEV.alta,
      title: 'Descripción insuficiente',
      description: 'La descripción es demasiado corta.',
      suggestedAction: 'Ampliar con specs, compatibilidad y paquete.',
      field: 'description',
      confidence: 0.95
    });
    findings.push(f);
    descriptionReview.agregar.push('Ampliar descripción con datos técnicos y contenido del paquete.');
  }

  if (/lorem ipsum|texto de ejemplo|descripcion pendiente/i.test(desc)) {
    findings.push(
      finding({
        findingType: 'error',
        severity: SEV.critica,
        title: 'Descripción placeholder',
        description: 'Texto de ejemplo detectado.',
        suggestedAction: 'Reemplazar por descripción real.',
        field: 'description',
        confidence: 1
      })
    );
    descriptionReview.eliminar.push('Eliminar texto de ejemplo / placeholder.');
  }

  if (titleHints.modelo && hints.modelo && titleHints.modelo.toLowerCase() !== hints.modelo.toLowerCase()) {
    findings.push(
      finding({
        findingType: 'inconsistencia',
        severity: SEV.critica,
        title: 'Modelo distinto entre título y descripción',
        description: `Título: ${titleHints.modelo} · Descripción: ${hints.modelo}`,
        suggestedAction: 'Unificar el modelo.',
        field: 'model',
        confidence: 0.9,
        evidence: [`title=${titleHints.modelo}`, `desc=${hints.modelo}`]
      })
    );
  }

  if (titleHints.voltaje && hints.voltaje && titleHints.voltaje !== hints.voltaje) {
    findings.push(
      finding({
        findingType: 'inconsistencia',
        severity: SEV.alta,
        title: 'Voltaje contradictorio',
        description: `Título: ${titleHints.voltaje} · Descripción: ${hints.voltaje}`,
        suggestedAction: 'Unificar voltaje.',
        field: 'voltaje',
        confidence: 0.9
      })
    );
  }

  if (
    titleHints.capacidad &&
    hints.capacidad &&
    titleHints.capacidad.toLowerCase() !== hints.capacidad.toLowerCase()
  ) {
    findings.push(
      finding({
        findingType: 'inconsistencia',
        severity: SEV.alta,
        title: 'Capacidad contradictoria',
        description: `Título: ${titleHints.capacidad} · Descripción: ${hints.capacidad}`,
        suggestedAction: 'Unificar la capacidad publicada.',
        field: 'capacidad',
        confidence: 0.85,
        evidence: [`title=${titleHints.capacidad}`, `desc=${hints.capacidad}`]
      })
    );
  }

  const specs = pub.specifications || {};
  for (const key of ['modelo', 'voltaje', 'capacidad', 'compatibilidad']) {
    const specVal = specs[key];
    const hintVal = hints[key];
    if (specVal && hintVal && String(specVal).toLowerCase() !== String(hintVal).toLowerCase()) {
      findings.push(
        finding({
          findingType: 'inconsistencia',
          severity: SEV.alta,
          title: `${key} distinto entre especificaciones y descripción`,
          description: `Especificaciones: ${specVal} · Descripción: ${hintVal}`,
          suggestedAction: `Unificar el valor de ${key}.`,
          field: key,
          confidence: 0.8,
          evidence: [`specs.${key}=${specVal}`, `desc.${key}=${hintVal}`]
        })
      );
    }
  }

  if (!(pub.images || []).length) {
    findings.push(
      finding({
        findingType: 'omision',
        severity: SEV.alta,
        title: 'Sin imágenes',
        description: 'La publicación no tiene imágenes.',
        suggestedAction: 'Agregar al menos una imagen.',
        field: 'images',
        confidence: 1
      })
    );
  }

  const rules = CATEGORY_RULES[categoryKey] || CATEGORY_RULES.general;
  const present = {
    marca: !!(pub.brand || hints.marca),
    modelo: !!(pub.model || hints.modelo),
    voltaje: !!hints.voltaje,
    potencia: !!hints.potencia,
    tipo_conexion: !!hints.tipo_conexion,
    compatibilidad: !!hints.compatibilidad,
    dimensiones: !!hints.dimensiones,
    anio_compatible: !!hints.anio_compatible,
    vehiculos_compatibles: !!(pub.specifications && (pub.specifications.vehiculos || pub.specifications.vehiculos_compatibles)),
    numero_parte: !!(pub.sku || (pub.specifications && pub.specifications.numero_parte)),
    dispositivos_compatibles: !!hints.compatibilidad,
    tamano: !!hints.dimensiones,
    version: !!(hints.modelo || pub.model),
    contenido_paquete: !!hints.contenido_paquete
  };

  for (const field of rules.required) {
    if (!present[field]) {
      const f = finding({
        findingType: 'omision',
        severity: field === 'modelo' || field === 'marca' ? SEV.alta : SEV.media,
        title: `Falta: ${field.replace(/_/g, ' ')}`,
        description: `Categoría "${rules.label}" espera "${field.replace(/_/g, ' ')}".`,
        suggestedAction: `Agregar ${field.replace(/_/g, ' ')}.`,
        field,
        confidence: 0.9
      });
      findings.push(f);
      missingInformation.push({ field, reason: `Relevante para ${rules.label}`, severity: f.severity });
      recommendations.push(
        recommendation({
          recommendationType: 'completitud',
          description: `Completar ${field.replace(/_/g, ' ')}.`,
          priority: f.severity === SEV.alta ? 2 : 3,
          findingId: f.id,
          field
        })
      );
    }
  }

  for (const q of rules.questions) {
    const related =
      (/compatible|vehículo|dispositivo/i.test(q) && !present.compatibilidad && !present.vehiculos_compatibles) ||
      (/modelo/i.test(q) && !present.modelo) ||
      (/medidas|tamaño/i.test(q) && !present.dimensiones) ||
      (/voltaje|110|220/i.test(q) && !present.voltaje) ||
      (/capacidad/i.test(q) && !hints.capacidad) ||
      (/incluye|accesorios|paquete|cargador|batería/i.test(q) && !present.contenido_paquete);
    if (related) {
      potentialBuyerQuestions.push({
        question: q,
        relatedField: Object.keys(present).find((k) => !present[k]) || 'general',
        clarificationNeeded: 'Agregar o aclarar este dato en la publicación.'
      });
    }
  }

  const recommendedTitle = buildRecommendedTitle(pub, { ...titleHints, ...hints });
  recommendations.unshift(
    recommendation({
      recommendationType: 'optimizacion',
      description: 'Título recomendado para Mercado Libre (máx. 60).',
      suggestedValue: recommendedTitle,
      priority: 1,
      field: 'title'
    })
  );

  const { qualityScore, auditStatus } = scoreAndStatus(findings);
  let draft = {
    qualityScore,
    auditStatus,
    recommendedTitle,
    missingInformation,
    potentialBuyerQuestions,
    descriptionReview,
    findings,
    recommendations,
    categoryKey,
    engine: 'rules'
  };
  return enrichWithOpenAI(pub, draft);
}
