import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';
import { config, COOKIE_NAME, SYSTEM_ROLES } from '../config.js';
import { ensureDefaultRoles, getRoleById, getRoleBySlug } from './roles.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
/** Costo bcrypt (≥ 12). No bajar en producción. */
const BCRYPT_COST = 12;

export function validateCredentials({ email, password, name }, { requireName = false } = {}) {
  const errors = [];
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(normalizedEmail)) errors.push('Email inválido');
  if (!password || String(password).length < MIN_PASSWORD) {
    errors.push(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres`);
  }
  if (requireName && !String(name || '').trim()) errors.push('El nombre es requerido');
  return { errors, email: normalizedEmail, name: String(name || '').trim() };
}

export function signToken(user) {
  if (!config.jwtSecret || config.jwtSecret.length < 16) {
    throw new Error('JWT_SECRET no configurado o demasiado corto');
  }
  return jwt.sign(
    { sub: user.id, role: user.roleSlug, email: user.email },
    config.jwtSecret,
    { expiresIn: `${config.jwtExpiresDays}d` }
  );
}

export function verifyToken(token) {
  if (!config.jwtSecret || config.jwtSecret.length < 16) {
    throw new Error('JWT_SECRET no configurado o demasiado corto');
  }
  const payload = jwt.verify(token, config.jwtSecret);
  if (!payload?.sub) {
    const err = new Error('Token inválido');
    err.name = 'JsonWebTokenError';
    throw err;
  }
  return payload;
}

export function cookieOptions() {
  const maxAge = config.jwtExpiresDays * 24 * 60 * 60 * 1000;
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge,
    path: '/'
  };
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, cookieOptions());
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: 0 });
}

export function publicUser(user, role) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roleId: user.roleId,
    roleSlug: role?.slug || user.roleSlug,
    roleName: role?.name || user.roleName,
    permissions: role?.permissions || user.permissions || [],
    isActive: user.isActive !== false,
    createdAt: user.createdAt
  };
}

export async function registerUser({ email, password, name }) {
  await ensureDefaultRoles();
  const db = getDb();
  const check = validateCredentials({ email, password, name }, { requireName: true });
  if (check.errors.length) {
    const err = new Error(check.errors.join('. '));
    err.status = 400;
    throw err;
  }

  const existing = await db.collection('users').findOne({ email: check.email });
  if (existing) {
    const err = new Error('Ya existe una cuenta con ese email');
    err.status = 409;
    throw err;
  }

  const userCount = await db.collection('users').countDocuments();
  const roleSlug = userCount === 0 ? SYSTEM_ROLES.ADMIN : SYSTEM_ROLES.USER;
  const role = await getRoleBySlug(roleSlug);
  if (!role) {
    const err = new Error('Roles del sistema no inicializados');
    err.status = 500;
    throw err;
  }

  const now = new Date();
  const user = {
    id: uuid(),
    email: check.email,
    name: check.name,
    passwordHash: await bcrypt.hash(password, BCRYPT_COST),
    roleId: role.id,
    roleSlug: role.slug,
    isActive: true,
    createdAt: now,
    updatedAt: now
  };

  await db.collection('users').insertOne(user);
  return publicUser(user, role);
}

export async function loginUser({ email, password }) {
  await ensureDefaultRoles();
  const check = validateCredentials({ email, password });
  if (check.errors.length) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  const db = getDb();
  const user = await db.collection('users').findOne({ email: check.email });
  if (!user || user.isActive === false) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  if (!user.passwordHash || !String(user.passwordHash).startsWith('$2')) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  const role = (await getRoleById(user.roleId)) || (await getRoleBySlug(user.roleSlug));
  return publicUser(user, role);
}

export async function getUserById(id) {
  const db = getDb();
  const user = await db.collection('users').findOne({ id }, { projection: { _id: 0, passwordHash: 0 } });
  if (!user) return null;
  const role = await getRoleById(user.roleId);
  return publicUser(user, role);
}

export { COOKIE_NAME };
