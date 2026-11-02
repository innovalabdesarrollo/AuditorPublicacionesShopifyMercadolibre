import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { config } from '../config.js';
import { getDb } from '../db.js';
import {
  persistAudit,
  refreshPublicationFromShopify,
  getFullReport,
  compareAudits
} from '../services/auditService.js';
import { fetchShopifyProducts, shopifyConfigured, shopifyAdminProductUrl } from '../services/shopify.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.post('/sync-shopify', async (req, res) => {
  try {
    if (!shopifyConfigured()) {
      return res.status(400).json({
        error: 'Shopify no configurado',
        hint: 'Pega en el .env (raíz o apps/api): SHOPIFY_STORE_DOMAIN y SHOPIFY_ACCESS_TOKEN (scope read_products)'
      });
    }
    const db = getDb();
    const products = await fetchShopifyProducts({ limit: Number(req.body?.limit || 50) });
    const upserted = [];

    for (const p of products) {
      const existing = await db.collection('publications').findOne({ shopifyProductId: p.shopifyProductId });
      const now = new Date();
      if (existing) {
        await db.collection('publications').updateOne(
          { id: existing.id },
          {
            $set: {
              title: p.title,
              description: p.description,
              productCategory: p.productCategory,
              productType: p.productType,
              brand: p.brand,
              model: p.model,
              sku: p.sku,
              specifications: p.specifications,
              images: p.images,
              variants: p.variants,
              shopifyAdminUrl: p.shopifyAdminUrl,
              updatedAt: now
            }
          }
        );
        upserted.push(existing.id);
      } else {
        const id = uuid();
        await db.collection('publications').insertOne({
          id,
          ...p,
          publicationStatus: 'pendiente',
          approvedForSync: false,
          latestAuditId: null,
          latestQualityScore: null,
          latestAuditStatus: null,
          errorCount: 0,
          createdAt: now,
          updatedAt: now
        });
        upserted.push(id);
      }
    }

    res.json({ synced: upserted.length, publicationIds: upserted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/audit-all', async (req, res) => {
  try {
    const db = getDb();
    const pubs = await db.collection('publications').find({}).toArray();
    const results = [];
    for (const pub of pubs) {
      const refreshed = await refreshPublicationFromShopify(pub);
      const r = await persistAudit(refreshed, refreshed.latestAuditId || null);
      results.push({ publicationId: pub.id, auditId: r.audit.id, score: r.audit.qualityScore });
    }
    res.json({ audited: results.length, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { status, minScore, maxScore, severity, category, sort = 'updatedAt', order = 'desc', q } = req.query;

    const filter = {};
    if (status) filter.publicationStatus = status;
    if (category) filter.productCategory = new RegExp(String(category), 'i');
    if (minScore || maxScore) {
      filter.latestQualityScore = {};
      if (minScore) filter.latestQualityScore.$gte = Number(minScore);
      if (maxScore) filter.latestQualityScore.$lte = Number(maxScore);
    }
    if (q) {
      filter.$or = [
        { title: new RegExp(String(q), 'i') },
        { sku: new RegExp(String(q), 'i') },
        { shopifyProductId: new RegExp(String(q), 'i') }
      ];
    }

    const sortField = ['updatedAt', 'latestQualityScore', 'title', 'errorCount'].includes(sort) ? sort : 'updatedAt';
    const sortDir = order === 'asc' ? 1 : -1;

    let items = await db
      .collection('publications')
      .find(filter, { projection: { _id: 0 } })
      .sort({ [sortField]: sortDir })
      .toArray();

    if (severity) {
      const auditIds = items.map((p) => p.latestAuditId).filter(Boolean);
      const matching = await db
        .collection('findings')
        .find({ auditId: { $in: auditIds }, severity: String(severity) }, { projection: { auditId: 1 } })
        .toArray();
      const set = new Set(matching.map((f) => f.auditId));
      items = items.filter((p) => set.has(p.latestAuditId));
    }

    res.json({
      items,
      total: items.length,
      shopifyConfigured: shopifyConfigured(),
      openaiConfigured: Boolean(config.openaiApiKey)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const report = await getFullReport(req.params.id);
    if (!report) return res.status(404).json({ error: 'Publicación no encontrada' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/compare', async (req, res) => {
  try {
    const { a, b } = req.query;
    if (!a || !b) return res.status(400).json({ error: 'Parámetros a y b (audit ids) requeridos' });
    const result = await compareAudits(req.params.id, String(a), String(b));
    if (!result) return res.status(404).json({ error: 'Auditorías no encontradas' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/audit', async (req, res) => {
  try {
    const db = getDb();
    let publication = await db.collection('publications').findOne({ id: req.params.id });
    if (!publication) return res.status(404).json({ error: 'Publicación no encontrada' });

    await db.collection('publications').updateOne(
      { id: publication.id },
      { $set: { publicationStatus: 'auditando', updatedAt: new Date() } }
    );

    publication = await refreshPublicationFromShopify(publication);
    const previousAuditId = publication.latestAuditId || null;
    await persistAudit(publication, previousAuditId);
    const report = await getFullReport(publication.id);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/approve', async (req, res) => {
  try {
    const db = getDb();
    const publication = await db.collection('publications').findOne({ id: req.params.id });
    if (!publication) return res.status(404).json({ error: 'Publicación no encontrada' });

    const audit = publication.latestAuditId
      ? await db.collection('audits').findOne({ id: publication.latestAuditId })
      : null;
    if (!audit) return res.status(400).json({ error: 'Sin auditoría vigente' });

    const critical = await db
      .collection('findings')
      .find({ auditId: audit.id, severity: 'critica', isResolved: { $ne: true } })
      .toArray();

    const {
      approvedBy = req.user?.email || 'responsable_catalogo',
      force = false,
      decisionReason = ''
    } = req.body || {};

    if (critical.length && !force) {
      return res.status(409).json({
        error: 'No se puede aprobar: hay errores críticos pendientes',
        criticalFindings: critical.map((f) => ({ id: f.id, title: f.title, description: f.description })),
        requiresJustification: true
      });
    }

    if (critical.length && force && !String(decisionReason).trim()) {
      return res.status(400).json({
        error: 'Aprobación excepcional requiere justificación',
        criticalFindings: critical.map((f) => ({ id: f.id, title: f.title }))
      });
    }

    const decidedAt = new Date();
    const approval = {
      id: uuid(),
      publicationId: publication.id,
      status: critical.length ? 'aprobada_excepcional' : 'aprobada',
      decisionReason: critical.length
        ? decisionReason
        : decisionReason || 'Sin errores críticos; cumple criterios de calidad',
      approvedBy,
      decidedAt
    };

    await db.collection('sync_approvals').insertOne(approval);
    await db.collection('publications').updateOne(
      { id: publication.id },
      {
        $set: {
          approvedForSync: true,
          publicationStatus: 'aprobada_para_sync',
          approvedAt: decidedAt,
          approvedBy,
          updatedAt: decidedAt
        }
      }
    );

    res.json({ approval, publicationId: publication.id, approvedForSync: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const body = req.body || {};
    if (!body.title || !body.shopifyProductId) {
      return res.status(400).json({ error: 'title y shopifyProductId son requeridos' });
    }
    const now = new Date();
    const doc = {
      id: uuid(),
      shopifyProductId: String(body.shopifyProductId),
      title: body.title,
      description: body.description || '',
      productCategory: body.productCategory || 'general',
      productType: body.productType || body.productCategory || '',
      brand: body.brand || '',
      model: body.model || '',
      sku: body.sku || '',
      packageContents: body.packageContents || '',
      specifications: body.specifications || {},
      images: body.images || [],
      variants: body.variants || [],
      shopifyAdminUrl: body.shopifyAdminUrl || shopifyAdminProductUrl(body.shopifyProductId),
      publicationStatus: 'pendiente',
      approvedForSync: false,
      latestAuditId: null,
      latestQualityScore: null,
      latestAuditStatus: null,
      errorCount: 0,
      createdAt: now,
      updatedAt: now
    };
    await db.collection('publications').insertOne(doc);
    const { _id, ...safe } = doc;
    res.status(201).json(safe);
  } catch (err) {
    if (String(err.message).includes('duplicate')) {
      return res.status(409).json({ error: 'Ya existe una publicación con ese shopifyProductId' });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
