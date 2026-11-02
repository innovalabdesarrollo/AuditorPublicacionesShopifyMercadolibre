import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { ensureDefaultRoles, getRoleById, listRoles } from '../services/roles.js';
import { SYSTEM_ROLES } from '../config.js';
import { publicUser } from '../services/auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

function slugify(name = '') {
  return String(name)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40);
}

router.get('/roles', async (_req, res) => {
  try {
    await ensureDefaultRoles();
    const roles = await listRoles();
    res.json({ items: roles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/roles', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const description = String(req.body?.description || '').trim();
    const permissions = Array.isArray(req.body?.permissions)
      ? req.body.permissions.map(String)
      : ['audit'];
    if (!name) return res.status(400).json({ error: 'Nombre de rol requerido' });

    let slug = slugify(req.body?.slug || name);
    if (!slug) return res.status(400).json({ error: 'Slug inválido' });
    if ([SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.USER].includes(slug)) {
      return res.status(400).json({ error: 'No se puede crear un rol con slug de sistema' });
    }

    const db = getDb();
    const exists = await db.collection('roles').findOne({ $or: [{ slug }, { name }] });
    if (exists) return res.status(409).json({ error: 'Ya existe un rol con ese nombre o slug' });

    const role = {
      id: uuid(),
      slug,
      name,
      description,
      permissions,
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.collection('roles').insertOne(role);
    const { _id, ...safe } = role;
    res.status(201).json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/roles/:id', async (req, res) => {
  try {
    const db = getDb();
    const role = await db.collection('roles').findOne({ id: req.params.id });
    if (!role) return res.status(404).json({ error: 'Rol no encontrado' });

    const $set = { updatedAt: new Date() };
    if (req.body?.name != null) $set.name = String(req.body.name).trim();
    if (req.body?.description != null) $set.description = String(req.body.description).trim();
    if (Array.isArray(req.body?.permissions)) $set.permissions = req.body.permissions.map(String);

    if (role.isSystem) {
      // Roles de sistema: solo descripción/nombre amigable, no slug ni borrar permisos base
      delete $set.slug;
    }

    await db.collection('roles').updateOne({ id: role.id }, { $set });
    const updated = await getRoleById(role.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/roles/:id', async (req, res) => {
  try {
    const db = getDb();
    const role = await db.collection('roles').findOne({ id: req.params.id });
    if (!role) return res.status(404).json({ error: 'Rol no encontrado' });
    if (role.isSystem) return res.status(400).json({ error: 'No se pueden eliminar roles de sistema' });

    const inUse = await db.collection('users').countDocuments({ roleId: role.id });
    if (inUse > 0) {
      return res.status(409).json({ error: `Hay ${inUse} usuario(s) con este rol. Reasígnalos primero.` });
    }

    await db.collection('roles').deleteOne({ id: role.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (_req, res) => {
  try {
    const db = getDb();
    const users = await db
      .collection('users')
      .find({}, { projection: { _id: 0, passwordHash: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    const roles = await listRoles();
    const byId = Object.fromEntries(roles.map((r) => [r.id, r]));
    res.json({
      items: users.map((u) => publicUser(u, byId[u.roleId]))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const db = getDb();
    const user = await db.collection('users').findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const $set = { updatedAt: new Date() };

    if (req.body?.roleId) {
      const role = await getRoleById(req.body.roleId);
      if (!role) return res.status(400).json({ error: 'Rol inválido' });
      // Evitar quedarse sin admin
      if (user.roleSlug === SYSTEM_ROLES.ADMIN && role.slug !== SYSTEM_ROLES.ADMIN) {
        const admins = await db.collection('users').countDocuments({
          roleSlug: SYSTEM_ROLES.ADMIN,
          isActive: { $ne: false }
        });
        if (admins <= 1) {
          return res.status(400).json({ error: 'Debe existir al menos un administrador activo' });
        }
      }
      $set.roleId = role.id;
      $set.roleSlug = role.slug;
    }

    if (typeof req.body?.isActive === 'boolean') {
      if (user.roleSlug === SYSTEM_ROLES.ADMIN && req.body.isActive === false) {
        const admins = await db.collection('users').countDocuments({
          roleSlug: SYSTEM_ROLES.ADMIN,
          isActive: { $ne: false },
          id: { $ne: user.id }
        });
        if (admins < 1) {
          return res.status(400).json({ error: 'Debe existir al menos un administrador activo' });
        }
      }
      $set.isActive = req.body.isActive;
    }

    if (req.body?.name != null) $set.name = String(req.body.name).trim();

    await db.collection('users').updateOne({ id: user.id }, { $set });
    const updated = await db.collection('users').findOne({ id: user.id }, { projection: { _id: 0, passwordHash: 0 } });
    const role = await getRoleById(updated.roleId);
    res.json(publicUser(updated, role));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
