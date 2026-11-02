import { v4 as uuid } from 'uuid';
import { config } from '../config.js';
import { getDb } from '../db.js';
import { runAudit } from './auditEngine.js';
import { fetchShopifyProduct, shopifyConfigured, shopifyAdminProductUrl } from './shopify.js';

function mapPublicationStatus(auditStatus, approvedForSync) {
  if (approvedForSync) return 'aprobada_para_sync';
  if (auditStatus === 'lista_para_mercado_libre') return 'lista';
  if (auditStatus === 'requiere_correcciones_importantes') return 'requiere_correcciones';
  if (auditStatus === 'requiere_mejoras') return 'requiere_mejoras';
  return 'pendiente';
}

export async function persistAudit(publication, previousAuditId = null) {
  const db = getDb();
  const result = await runAudit(publication);
  const auditId = uuid();
  const auditedAt = new Date();

  const auditDoc = {
    id: auditId,
    publicationId: publication.id,
    qualityScore: result.qualityScore,
    auditStatus: result.auditStatus,
    recommendedTitle: result.recommendedTitle,
    missingInformation: result.missingInformation,
    potentialBuyerQuestions: result.potentialBuyerQuestions,
    descriptionReview: result.descriptionReview,
    categoryKey: result.categoryKey,
    engine: result.engine,
    previousAuditId,
    processingStatus: 'completada',
    auditedAt
  };

  const findingDocs = result.findings.map((f) => ({ ...f, auditId, createdAt: auditedAt }));
  const recommendationDocs = result.recommendations.map((r) => ({ ...r, auditId, createdAt: auditedAt }));

  await db.collection('audits').insertOne(auditDoc);
  if (findingDocs.length) await db.collection('findings').insertMany(findingDocs);
  if (recommendationDocs.length) await db.collection('recommendations').insertMany(recommendationDocs);

  await db.collection('publications').updateOne(
    { id: publication.id },
    {
      $set: {
        publicationStatus: mapPublicationStatus(result.auditStatus, publication.approvedForSync),
        latestAuditId: auditId,
        latestQualityScore: result.qualityScore,
        latestAuditStatus: result.auditStatus,
        errorCount: findingDocs.filter(
          (f) => f.findingType === 'error' || f.severity === 'critica' || f.severity === 'alta'
        ).length,
        updatedAt: auditedAt
      }
    }
  );

  if (previousAuditId) {
    const prevFindings = await db.collection('findings').find({ auditId: previousAuditId }).toArray();
    const currentTitles = new Set(findingDocs.map((f) => f.title));
    for (const pf of prevFindings) {
      if (!currentTitles.has(pf.title)) {
        await db.collection('findings').updateOne({ id: pf.id }, { $set: { isResolved: true, resolvedAt: auditedAt } });
        await db.collection('corrections').insertOne({
          id: uuid(),
          publicationId: publication.id,
          findingId: pf.id,
          description: `Hallazgo resuelto entre auditorías: ${pf.title}`,
          fieldName: pf.field || 'general',
          previousValue: pf.description,
          correctedValue: 'Corregido / ya no detectado',
          status: 'verificada',
          appliedAt: auditedAt
        });
      }
    }
  }

  return { audit: auditDoc, findings: findingDocs, recommendations: recommendationDocs };
}

export async function refreshPublicationFromShopify(publication) {
  if (!shopifyConfigured()) return publication;
  try {
    const remote = await fetchShopifyProduct(publication.shopifyProductId);
    const db = getDb();
    const updated = {
      ...publication,
      title: remote.title,
      description: remote.description,
      productCategory: remote.productCategory || publication.productCategory,
      productType: remote.productType,
      brand: remote.brand,
      model: remote.model || publication.model,
      sku: remote.sku || publication.sku,
      specifications: remote.specifications || publication.specifications,
      images: remote.images,
      variants: remote.variants,
      shopifyAdminUrl: remote.shopifyAdminUrl || shopifyAdminProductUrl(publication.shopifyProductId),
      updatedAt: new Date()
    };
    await db.collection('publications').updateOne(
      { id: publication.id },
      {
        $set: {
          title: updated.title,
          description: updated.description,
          productCategory: updated.productCategory,
          productType: updated.productType,
          brand: updated.brand,
          model: updated.model,
          sku: updated.sku,
          specifications: updated.specifications,
          images: updated.images,
          variants: updated.variants,
          shopifyAdminUrl: updated.shopifyAdminUrl,
          updatedAt: updated.updatedAt
        }
      }
    );
    return updated;
  } catch {
    return publication;
  }
}

export async function getFullReport(publicationId) {
  const db = getDb();
  const publication = await db.collection('publications').findOne({ id: publicationId }, { projection: { _id: 0 } });
  if (!publication) return null;

  // Si hay dominio en .env, el link Admin se arma solo con credenciales (sin re-sync).
  const fromEnv = shopifyAdminProductUrl(publication.shopifyProductId);
  if (fromEnv) publication.shopifyAdminUrl = fromEnv;

  const audits = await db
    .collection('audits')
    .find({ publicationId }, { projection: { _id: 0 } })
    .sort({ auditedAt: -1 })
    .toArray();

  const latest = audits[0] || null;
  let findings = [];
  let recommendations = [];
  if (latest) {
    findings = await db.collection('findings').find({ auditId: latest.id }, { projection: { _id: 0 } }).toArray();
    recommendations = await db
      .collection('recommendations')
      .find({ auditId: latest.id }, { projection: { _id: 0 } })
      .sort({ priority: 1 })
      .toArray();
  }

  const corrections = await db
    .collection('corrections')
    .find({ publicationId }, { projection: { _id: 0 } })
    .sort({ appliedAt: -1 })
    .toArray();

  const approvals = await db
    .collection('sync_approvals')
    .find({ publicationId }, { projection: { _id: 0 } })
    .sort({ decidedAt: -1 })
    .toArray();

  const severityOrder = { critica: 0, alta: 1, media: 2, baja: 3 };
  findings.sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9));

  return {
    publication,
    audit: latest,
    audits,
    findings,
    recommendations,
    corrections,
    approvals,
    openaiConfigured: Boolean(config.openaiApiKey),
    comparison: latest
      ? {
          title: publication.title,
          description: publication.description,
          brand: publication.brand,
          model: publication.model,
          specifications: publication.specifications,
          images: publication.images,
          inconsistencies: findings.filter((f) => f.findingType === 'inconsistencia')
        }
      : null
  };
}

export async function compareAudits(publicationId, auditIdA, auditIdB) {
  const db = getDb();
  const [a, b] = await Promise.all([
    db.collection('audits').findOne({ id: auditIdA, publicationId }, { projection: { _id: 0 } }),
    db.collection('audits').findOne({ id: auditIdB, publicationId }, { projection: { _id: 0 } })
  ]);
  if (!a || !b) return null;
  const [findingsA, findingsB] = await Promise.all([
    db.collection('findings').find({ auditId: auditIdA }, { projection: { _id: 0 } }).toArray(),
    db.collection('findings').find({ auditId: auditIdB }, { projection: { _id: 0 } }).toArray()
  ]);
  const titlesA = new Set(findingsA.map((f) => f.title));
  const titlesB = new Set(findingsB.map((f) => f.title));
  return {
    auditA: a,
    auditB: b,
    resolved: findingsA.filter((f) => !titlesB.has(f.title)),
    pending: findingsB.filter((f) => titlesA.has(f.title)),
    newFindings: findingsB.filter((f) => !titlesA.has(f.title)),
    scoreDelta: (b.qualityScore ?? 0) - (a.qualityScore ?? 0)
  };
}
