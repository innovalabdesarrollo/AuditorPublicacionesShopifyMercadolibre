# Auditor Inteligente de Publicaciones Shopify → Mercado Libre

MVP: autenticación, roles (admin/user) y auditoría de publicaciones Shopify antes de Mercado Libre.

## Stack

- `apps/web` — SvelteKit + Tailwind → **Vercel** (`@sveltejs/adapter-vercel`)
- `apps/api` — Express + MongoDB Atlas → **Vercel** (Function Express)
- Auth: JWT (cookie httpOnly + Bearer) · bcrypt · roles en Mongo

## `.env` (local)

```bash
cp .env.example .env
# edita MONGODB_URI + JWT_SECRET
```

| Quién | Variables |
| --- | --- |
| **Equipo** | `MONGODB_URI`, `JWT_SECRET`, `PUBLIC_API_URL`, `CORS_ORIGIN`, `PORT`/`WEB_PORT` (local) |
| **Cliente** (opc.) | `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ACCESS_TOKEN`, `OPENAI_API_KEY` |

`JWT_SECRET`: `openssl rand -hex 32`

## Correr local

```bash
pnpm i
pnpm seed
pnpm dev
```

- Web: `WEB_PORT` (ej. http://localhost:5173)
- API: `PORT` (ej. http://localhost:3002) = `PUBLIC_API_URL`

1. `/registro` — el **primer** usuario es **admin**
2. Siguientes → **user**
3. `/admin` — roles y usuarios (solo admin)

## Publicar en Vercel (2 proyectos del mismo monorepo)

Crea **dos** proyectos en Vercel apuntando al **mismo** repo Git:

### 1) API — Root Directory: `apps/api`

Variables de entorno:

| Key | Valor |
| --- | --- |
| `MONGODB_URI` | URI Atlas (DB `auditor_shopify_ml`) |
| `JWT_SECRET` | secreto largo |
| `CORS_ORIGIN` | URL del front en Vercel (ej. `https://tu-web.vercel.app`) |
| `SHOPIFY_*` / `OPENAI_*` | opcionales (pegar cuando el cliente las dé) |

Framework: Express (auto). Install ya está en `apps/api/vercel.json` (`pnpm` desde la raíz del monorepo).

Tras el deploy, copia la URL → ej. `https://tu-api.vercel.app`

### 2) Web — Root Directory: `apps/web`

| Key | Valor |
| --- | --- |
| `PUBLIC_API_URL` | URL del API del paso 1 (sin slash final) |

Framework: SvelteKit. Node **≥24.22.1** (o ≥22.23.4) — ver `.nvmrc`.

## Seguridad Node (oct 2026 — la vigente)

La más reciente: [Security Releases 21 oct 2026](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases)  
Mínimos: **24.22.1**, **22.23.4**, **26.12.1** (Brotli RCE CVE-2026-111497, DNS NUL CVE-2026-105482, bypass TLS, etc.).  
También relevantes: [29 jul 2026](https://nodejs.org/en/blog/vulnerability/july-2026-security-releases), [24 mar 2026](https://nodejs.org/en/blog/vulnerability/march-2026-security-releases).  

Local: **no hace falta pelear con el PATH**. Los scripts (`pnpm dev`, `pnpm seed`, `pnpm start:api`) pasan por `scripts/with-node.mjs`, que elige solo un Node ≥24.22.1 / ≥22.23.4 (p. ej. `~/.local/bin/node`) y falla si no hay uno seguro. El API también se niega a arrancar en runtime viejo.  
Vercel: runtime `nodejs24.x` + `engines` del repo.

### Orden recomendado

1. Deploy API → anota URL  
2. Deploy Web con `PUBLIC_API_URL`  
3. Ajusta `CORS_ORIGIN` del API a la URL del Web y redeploy API si hace falta  
4. Abre el Web → `/registro` (primer admin)  
5. Opcional: `pnpm seed` contra Atlas desde tu máquina (una vez)

Shopify/OpenAI vacíos: la app funciona con seed/demo; Sync Shopify y IA quedan listos al pegar keys.

## Seguridad (MVP)

- bcrypt cost 12 · JWT · rutas API protegidas · `/admin` solo admin

## Fuera de alcance

Auth Google, email, sync real a Mercado Libre, escritura automática en Shopify.
