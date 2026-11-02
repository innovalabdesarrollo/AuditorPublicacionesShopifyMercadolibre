/**
 * Smoke mínimo contra API local (health + auth + listado).
 * No es unitario: valida que el sistema levantado responde.
 */
const BASE = process.env.PUBLIC_API_URL || process.env.SMOKE_API_URL || 'http://localhost:3002';

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

function ok(cond, msg) {
  if (!cond) throw new Error(msg);
}

const email = `smoke-${Date.now()}@test.local`;
const password = 'SmokePass123!';

const health = await req('/health');
ok(health.res.ok && health.data.ok, `health falló: ${JSON.stringify(health.data)}`);
ok(health.data.dbName === 'auditor_shopify_ml', `DB inesperada: ${health.data.dbName}`);
ok(health.data.project === 'auditor-shopify-ml', 'project incorrecto');

const reg = await req('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({ name: 'Smoke', email, password })
});
ok(reg.res.ok && reg.data.token, `register: ${JSON.stringify(reg.data)}`);

const list = await req('/api/publications?limit=5', {
  headers: { Authorization: `Bearer ${reg.data.token}` }
});
ok(list.res.ok && Array.isArray(list.data.items), `list: ${JSON.stringify(list.data)}`);

console.log(
  JSON.stringify(
    {
      ok: true,
      port: health.data.port,
      dbName: health.data.dbName,
      users: health.data.users,
      publications: list.data.items.length,
      shopifyConfigured: health.data.shopifyConfigured
    },
    null,
    2
  )
);
