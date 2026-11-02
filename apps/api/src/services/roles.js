import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';
import { SYSTEM_ROLES } from '../config.js';

const DEFAULT_ROLES = [
  {
    slug: SYSTEM_ROLES.ADMIN,
    name: 'Administrador',
    description: 'Acceso total: administración de roles, usuarios y auditoría.',
    isSystem: true,
    permissions: ['admin', 'audit', 'approve', 'manage_users', 'manage_roles']
  },
  {
    slug: SYSTEM_ROLES.USER,
    name: 'Usuario',
    description: 'Acceso operativo: consultar y auditar publicaciones.',
    isSystem: true,
    permissions: ['audit', 'approve']
  }
];

export async function ensureDefaultRoles() {
  const db = getDb();
  for (const role of DEFAULT_ROLES) {
    const existing = await db.collection('roles').findOne({ slug: role.slug });
    if (!existing) {
      await db.collection('roles').insertOne({
        id: uuid(),
        ...role,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      await db.collection('roles').updateOne(
        { id: existing.id },
        {
          $set: {
            name: role.name,
            description: role.description,
            permissions: role.permissions,
            isSystem: true,
            updatedAt: new Date()
          }
        }
      );
    }
  }
}

export async function getRoleBySlug(slug) {
  return getDb().collection('roles').findOne({ slug }, { projection: { _id: 0 } });
}

export async function getRoleById(id) {
  return getDb().collection('roles').findOne({ id }, { projection: { _id: 0 } });
}

export async function listRoles() {
  return getDb().collection('roles').find({}, { projection: { _id: 0 } }).sort({ isSystem: -1, name: 1 }).toArray();
}

export function sanitizeRole(role) {
  if (!role) return null;
  const { _id, ...safe } = role;
  return safe;
}
