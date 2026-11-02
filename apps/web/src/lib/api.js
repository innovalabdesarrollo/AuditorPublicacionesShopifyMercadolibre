import { env } from '$env/dynamic/public';
import { getToken, setToken, user } from './auth.js';

const BASE = env.PUBLIC_API_URL || '';

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include'
  });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    setToken(null);
    user.set(null);
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }

  if (!res.ok) {
    const err = new Error(data.error || `Error ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  listPublications: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== '' && v != null) qs.set(k, v);
    });
    return request(`/api/publications?${qs}`);
  },
  getReport: (id) => request(`/api/publications/${id}`),
  compare: (id, a, b) => request(`/api/publications/${id}/compare?a=${a}&b=${b}`),
  audit: (id) => request(`/api/publications/${id}/audit`, { method: 'POST' }),
  auditAll: () => request(`/api/publications/audit-all`, { method: 'POST' }),
  syncShopify: () => request(`/api/publications/sync-shopify`, { method: 'POST', body: '{}' }),
  approve: (id, body) =>
    request(`/api/publications/${id}/approve`, { method: 'POST', body: JSON.stringify(body || {}) }),
  health: () => request('/health'),
  adminRoles: () => request('/api/admin/roles'),
  createRole: (body) => request('/api/admin/roles', { method: 'POST', body: JSON.stringify(body) }),
  updateRole: (id, body) => request(`/api/admin/roles/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteRole: (id) => request(`/api/admin/roles/${id}`, { method: 'DELETE' }),
  adminUsers: () => request('/api/admin/users'),
  updateUser: (id, body) => request(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
};

export function statusLabel(status) {
  const map = {
    lista_para_mercado_libre: 'Lista para Mercado Libre',
    requiere_mejoras: 'Requiere mejoras',
    requiere_correcciones_importantes: 'Requiere correcciones importantes',
    lista: 'Lista',
    requiere_correcciones: 'Requiere correcciones',
    aprobada_para_sync: 'Aprobada para sync',
    pendiente: 'Pendiente',
    auditando: 'Auditando…'
  };
  return map[status] || status || '—';
}

export function statusClass(status) {
  if (status === 'lista_para_mercado_libre' || status === 'lista' || status === 'aprobada_para_sync') {
    return 'chip bg-ok-soft text-ok';
  }
  if (status === 'requiere_correcciones_importantes' || status === 'requiere_correcciones') {
    return 'chip bg-danger-soft text-danger';
  }
  if (status === 'requiere_mejoras') return 'chip bg-warn-soft text-warn';
  return 'chip bg-ink-100 text-ink-700';
}

export function severityClass(sev) {
  if (sev === 'critica') return 'chip bg-danger text-white';
  if (sev === 'alta') return 'chip bg-danger-soft text-danger';
  if (sev === 'media') return 'chip bg-warn-soft text-warn';
  return 'chip bg-ink-100 text-ink-700';
}

export function scoreColor(score) {
  if (score == null) return 'text-ink-500';
  if (score >= 80) return 'text-ok';
  if (score >= 50) return 'text-warn';
  return 'text-danger';
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Mexico_City'
  });
}
