#!/usr/bin/env node
/**
 * Garantiza Node parcheado (oct 2026+) antes de correr cualquier comando.
 * Si el `node` actual es viejo, re-ejecuta con un binario seguro y PATH ajustado.
 *
 * Mínimos por línea: 24.22.1+ | 22.23.4+ | 26.12.1+
 * @see https://nodejs.org/en/blog/vulnerability/october-2026-security-releases
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function parseVersion(raw) {
  const m = String(raw || '')
    .trim()
    .replace(/^v/i, '')
    .match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) return null;
  return { major: +m[1], minor: +m[2], patch: +m[3] };
}

/** Solo la línea correspondiente cuenta (24.14 no “cumple” por ser >22). */
function isSafe(version) {
  const v = typeof version === 'string' ? parseVersion(version) : version;
  if (!v) return false;
  if (v.major === 26) return v.minor > 12 || (v.minor === 12 && v.patch >= 1);
  if (v.major === 24) return v.minor > 22 || (v.minor === 22 && v.patch >= 1);
  if (v.major === 22) return v.minor > 23 || (v.minor === 23 && v.patch >= 4);
  return false;
}

function versionOf(bin) {
  try {
    const r = spawnSync(bin, ['-p', 'process.version'], { encoding: 'utf8' });
    if (r.status !== 0) return null;
    return parseVersion(r.stdout);
  } catch {
    return null;
  }
}

function candidateBins() {
  const home = homedir();
  const list = [
    process.env.NODE_BINARY,
    path.join(home, '.local/bin/node'),
    path.join(home, '.nvm/current/bin/node'),
    path.join(home, '.nvm/versions/node/v24.22.2/bin/node'),
    path.join(home, '.nvm/versions/node/v24.22.1/bin/node'),
    path.join(home, '.nvm/versions/node/v22.23.4/bin/node'),
    '/usr/local/bin/node',
    process.execPath
  ];
  return [...new Set(list.filter(Boolean))];
}

function findSafeNode() {
  if (isSafe(process.version)) return process.execPath;
  for (const bin of candidateBins()) {
    if (!existsSync(bin)) continue;
    const v = versionOf(bin);
    if (v && isSafe(v)) return bin;
  }
  return null;
}

const args = process.argv.slice(2);
if (!args.length) {
  console.error('Uso: node scripts/with-node.mjs <comando> [args...]');
  process.exit(2);
}

const safe = findSafeNode();
if (!safe) {
  console.error(`
[auditor] Node inseguro o ausente.
  Actual: ${process.version}
  Requerido (oct 2026): >=24.22.1  o  >=22.23.4  o  >=26.12.1

Instala (sin sudo), por ejemplo:
  curl -fsSL https://nodejs.org/dist/v24.22.2/node-v24.22.2-linux-x64.tar.xz \\
    | tar -xJ -C "$HOME/.local" --strip-components=1
`);
  process.exit(1);
}

const safeDir = path.dirname(safe);
const env = {
  ...process.env,
  PATH: `${safeDir}${path.delimiter}${process.env.PATH || ''}`,
  npm_config_engine_strict: 'true'
};

if (path.resolve(safe) !== path.resolve(process.execPath)) {
  const self = fileURLToPath(import.meta.url);
  const r = spawnSync(safe, [self, ...args], { stdio: 'inherit', env });
  process.exit(r.status ?? 1);
}

const cmd = args[0];
const cmdArgs = args.slice(1);
const r = spawnSync(cmd, cmdArgs, { stdio: 'inherit', env, shell: false });
process.exit(r.status ?? 1);
