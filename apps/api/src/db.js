import { MongoClient } from 'mongodb';
import { config } from './config.js';

/** Nombre fijo: no mezclar con otras DBs del mismo cluster Atlas. */
export const DB_NAME = 'auditor_shopify_ml';

let client;
let db;

export async function connectDb() {
  if (db) return db;
  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI no configurada. Copia .env.example a apps/api/.env o raíz/.env');
  }
  client = new MongoClient(config.mongodbUri);
  await client.connect();
  // Siempre esta DB (aunque la URI omita o cambie el path).
  db = client.db(DB_NAME);
  await ensureIndexes(db);
  return db;
}

export function getDb() {
  if (!db) throw new Error('DB no conectada');
  return db;
}

async function ensureIndexes(database) {
  await database.collection('roles').createIndexes([
    { key: { name: 1 }, unique: true },
    { key: { slug: 1 }, unique: true }
  ]);
  await database.collection('users').createIndexes([
    { key: { email: 1 }, unique: true },
    { key: { roleId: 1 } },
    { key: { isActive: 1 } }
  ]);
  await database.collection('publications').createIndexes([
    { key: { shopifyProductId: 1 }, unique: true },
    { key: { publicationStatus: 1 } },
    { key: { productCategory: 1 } },
    { key: { updatedAt: -1 } }
  ]);
  await database.collection('audits').createIndexes([
    { key: { publicationId: 1, auditedAt: -1 } }
  ]);
  await database.collection('findings').createIndexes([
    { key: { auditId: 1 } },
    { key: { severity: 1 } }
  ]);
  await database.collection('recommendations').createIndexes([
    { key: { auditId: 1 } },
    { key: { findingId: 1 } }
  ]);
  await database.collection('corrections').createIndexes([
    { key: { publicationId: 1 } },
    { key: { findingId: 1 } }
  ]);
  await database.collection('sync_approvals').createIndexes([
    { key: { publicationId: 1, decidedAt: -1 } }
  ]);
  await database.collection('audit_criteria').createIndexes([
    { key: { category: 1, isActive: 1 } }
  ]);
}
