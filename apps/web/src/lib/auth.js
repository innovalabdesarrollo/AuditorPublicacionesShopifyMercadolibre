import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

const BASE = env.PUBLIC_API_URL || '';
const TOKEN_KEY = 'auditor_token';

export const user = writable(null);
export const authReady = writable(false);
export const isAdmin = derived(user, ($u) => $u?.roleSlug === 'admin');

export function getToken() {
  if (!browser) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (!browser) return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function authFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include'
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Error ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const authApi = {
  register: (body) => authFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => authFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => authFetch('/api/auth/logout', { method: 'POST' }),
  me: () => authFetch('/api/auth/me')
};

export async function initAuth() {
  if (!browser) {
    authReady.set(true);
    return;
  }
  try {
    // Token en localStorage (Bearer) o cookie httpOnly (credentials: include)
    const data = await authApi.me();
    user.set(data.user);
    if (data.token) setToken(data.token);
  } catch {
    setToken(null);
    user.set(null);
  } finally {
    authReady.set(true);
  }
}

export async function login(email, password) {
  const data = await authApi.login({ email, password });
  setToken(data.token);
  user.set(data.user);
  return data.user;
}

export async function register(name, email, password) {
  const data = await authApi.register({ name, email, password });
  setToken(data.token);
  user.set(data.user);
  return data.user;
}

export async function logout() {
  try {
    await authApi.logout();
  } catch {
    /* ignore */
  }
  setToken(null);
  user.set(null);
}

export function requireUser() {
  return get(user);
}
