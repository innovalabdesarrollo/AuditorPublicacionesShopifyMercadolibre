import { COOKIE_NAME, SYSTEM_ROLES } from '../config.js';
import { getUserById, verifyToken } from '../services/auth.js';

function extractToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  if (req.cookies?.[COOKIE_NAME]) return req.cookies[COOKIE_NAME];
  return null;
}

export async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Sesión inválida o expirada' });
    }
    const user = await getUserById(payload.sub);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Usuario no válido' });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...slugs) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });
    if (!slugs.includes(req.user.roleSlug)) {
      return res.status(403).json({ error: 'No autorizado para esta acción' });
    }
    next();
  };
}

export function requirePermission(...perms) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });
    const userPerms = req.user.permissions || [];
    const ok = perms.some((p) => userPerms.includes(p) || req.user.roleSlug === SYSTEM_ROLES.ADMIN);
    if (!ok) return res.status(403).json({ error: 'No autorizado para esta acción' });
    next();
  };
}

export const requireAdmin = requireRole(SYSTEM_ROLES.ADMIN);
