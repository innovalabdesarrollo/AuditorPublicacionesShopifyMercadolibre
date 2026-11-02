import { v4 as uuid } from 'uuid';
import { connectDb, getDb } from './db.js';
import { persistAudit } from './services/auditService.js';
import { CATEGORY_RULES } from './services/categoryRules.js';
import { ensureDefaultRoles } from './services/roles.js';

const samples = [
  {
    shopifyProductId: '1001',
    title: 'Cargador USB Cargador Rápido USB C Universal Cargador para Celular Tablet Laptop',
    description: '<p>Cargador rápido. Modelo XYZ-200. Voltaje 110V. Incluye cable.</p>',
    productCategory: 'accesorios tecnológicos',
    brand: 'TechNova',
    model: 'XYZ-100',
    sku: 'TN-XYZ-100',
    specifications: { potencia: '20W' },
    images: ['https://cdn.shopify.com/s/files/1/example/cargador.jpg']
  },
  {
    shopifyProductId: '1002',
    title: 'Filtro de aceite Toyota',
    description: '<p>Filtro de aceite Toyota. Compatible 2015-2020. Número de parte TO-45821.</p>',
    productCategory: 'autopartes',
    brand: 'Toyota',
    model: 'TO-45821',
    sku: 'TO-45821',
    specifications: { vehiculos: 'Corolla, Camry' },
    images: ['https://cdn.shopify.com/s/files/1/example/filtro.jpg']
  },
  {
    shopifyProductId: '1003',
    title: 'Lorem ipsum producto demo',
    description: '<p>lorem ipsum texto de ejemplo descripcion pendiente</p>',
    productCategory: 'electrónicos',
    brand: '',
    model: '',
    sku: 'DEMO-003',
    specifications: {},
    images: []
  },
  {
    shopifyProductId: '1004',
    title: 'Audífonos BT Pro X5 40mm',
    description:
      '<p>Audífonos Bluetooth Pro X5 de TechAudio. Conexión Bluetooth 5.2. Incluye: audífonos, cable USB-C, estuche. Compatible con iOS y Android.</p>',
    productCategory: 'accesorios tecnológicos',
    brand: 'TechAudio',
    model: 'Pro X5',
    sku: 'TA-PRO-X5',
    specifications: { tipo_conexion: 'Bluetooth 5.2', compatibilidad: 'iOS/Android' },
    images: ['https://cdn.shopify.com/s/files/1/example/audifonos.jpg'],
    packageContents: 'Audífonos, cable USB-C, estuche'
  }
];

async function seedCriteria(db) {
  const count = await db.collection('audit_criteria').countDocuments();
  if (count > 0) return;
  const docs = [];
  for (const [key, rule] of Object.entries(CATEGORY_RULES)) {
    for (const field of rule.required) {
      docs.push({
        id: uuid(),
        name: `Requiere ${field}`,
        description: `El producto de categoría ${rule.label} debe incluir ${field.replace(/_/g, ' ')}.`,
        category: key,
        destination: 'mercado_libre',
        validationRule: `present(${field})`,
        isActive: true
      });
    }
  }
  await db.collection('audit_criteria').insertMany(docs);
}

async function main() {
  await connectDb();
  await ensureDefaultRoles();
  const db = getDb();
  await seedCriteria(db);

  for (const s of samples) {
    const existing = await db.collection('publications').findOne({ shopifyProductId: s.shopifyProductId });
    if (existing) {
      console.log('Skip existente', s.shopifyProductId);
      continue;
    }
    const now = new Date();
    const doc = {
      id: uuid(),
      ...s,
      productType: s.productCategory,
      variants: [],
      shopifyAdminUrl: `https://demo.myshopify.com/admin/products/${s.shopifyProductId}`,
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
    await persistAudit(doc, null);
    console.log('Seed + audit', doc.title.slice(0, 40));
  }

  const domain = [
    'roles',
    'users',
    'publications',
    'audits',
    'findings',
    'recommendations',
    'corrections',
    'sync_approvals',
    'audit_criteria'
  ];
  const summary = {};
  for (const name of domain) {
    summary[name] = await db.collection(name).countDocuments();
  }
  console.log('Colecciones dominio:', summary);
  console.log('Seed OK. Roles: admin, user. Primer registro será admin.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
