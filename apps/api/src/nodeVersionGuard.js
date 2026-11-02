/** Bloquea arranque si el runtime Node no tiene los parches de oct 2026. */
function parse(raw) {
  const m = String(raw || '')
    .replace(/^v/i, '')
    .match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) return null;
  return { major: +m[1], minor: +m[2], patch: +m[3] };
}

export function isSafeNodeVersion(raw) {
  const v = parse(raw);
  if (!v) return false;
  if (v.major === 26) return v.minor > 12 || (v.minor === 12 && v.patch >= 1);
  if (v.major === 24) return v.minor > 22 || (v.minor === 22 && v.patch >= 1);
  if (v.major === 22) return v.minor > 23 || (v.minor === 23 && v.patch >= 4);
  return false;
}

export function assertSafeNode() {
  // En Vercel el runtime lo fija la plataforma (nodejs24.x → último patch).
  if (process.env.VERCEL) return;

  if (isSafeNodeVersion(process.version)) return;

  console.error(
    `[auditor] Node ${process.version} no es seguro (se requiere >=24.22.1 o >=22.23.4 o >=26.12.1).\n` +
      `Usa: pnpm start:api / pnpm dev  (pasan por scripts/with-node.mjs)`
  );
  process.exit(1);
}
