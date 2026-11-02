# Checklist MVP — Auditor Shopify → Mercado Libre

Marca `[x]` al completar y verificar cada ítem. Trabajar de arriba hacia abajo.

## 1. Autenticación y autorización

- [x] **Registro y login** (email + contraseña) — pantallas `/registro` y `/login`, API `/api/auth/*`
- [x] **Contraseñas con bcrypt** (cost ≥ 12) — hash al registrar, compare al login, nunca se expone `passwordHash`
- [x] **JWT (cookie httpOnly + Bearer) y logout** — `auditor_token`, Bearer en header, `/api/auth/logout` limpia cookie + front limpia localStorage
- [x] **Protección de rutas API y front** — `requireAuth` en publications/admin; layout redirige a `/login`; 401 limpia sesión y manda a login
- [x] **Roles admin / user** — roles sistema en Mongo; primer usuario = admin, siguientes = user (sin cambios de código: ya existía)
- [x] **Módulo admin: roles y usuarios** — `/admin` + `/api/admin/*` (solo admin); listar/crear roles, listar/asignar usuarios (ya existía)

## 2. Auditoría de publicaciones

- [x] **Motor por reglas según categoría (+ OpenAI opcional)** — `categoryRules` + `auditEngine` (`rules` / `rules+openai`); ya existía
- [x] **Revisión de título (≤60 + título recomendado)** — hallazgo si >60; `recommendedTitle` ≤60; UI copia en detalle (ya existía)
- [x] **Revisión de descripción** — `descriptionReview` {corregir,eliminar,aclarar,agregar} en motor + UI detalle
- [x] **Faltantes por categoría** — reglas por categoría → `missingInformation` + UI; verificado las 4 categorías (ya existía)
- [x] **Inconsistencias** — modelo, voltaje, capacidad, specs vs descripción, sin imágenes; UI en hallazgos
- [x] **Preguntas potenciales del comprador** — por categoría en `potentialBuyerQuestions` + UI detalle (ya existía)
- [x] **Score 0–100 + estado** — `qualityScore` + `auditStatus` (lista / mejoras / correcciones); UI listado y detalle (ya existía)
- [x] **Severidad de hallazgos** — critica/alta/media/baja en motor; chips UI + filtro listado; orden por severidad (ya existía)
- [x] **Recomendaciones de optimización priorizadas** — tipos optimizacion/correccion/completitud con `priority`; API ordena; UI detalle (ya existía)

## 3. Flujo operativo

- [x] **Listado con filtros y orden** — estado, score, severidad, búsqueda, sort/order; API + UI `/` (ya existía)
- [x] **Detalle de reporte completo** — `GET /api/publications/:id` + UI `/publicaciones/[id]` (score, estado, título, hallazgos, descripción, faltantes, preguntas, recomendaciones) (ya existía)
- [x] **Re-auditar (una / todas)** — `POST /:id/audit` + `POST /audit-all`; botones UI detalle y listado (ya existía)
- [x] **Comparar auditorías** — `GET /:id/compare` + UI Seguimiento (resueltos / pendientes / nuevos) (ya existía)
- [x] **Copiar título recomendado** — botón Copiar → `navigator.clipboard` con `recommendedTitle` (ya existía)
- [x] **Link editar en Shopify** — botón en detalle; URL desde `SHOPIFY_STORE_DOMAIN` + `shopifyProductId` (solo .env; sin re-sync)
- [x] **Aprobar sync ML** — `POST /:id/approve` + UI; bloquea críticos (409); excepción con `force` + justificación; historial en `sync_approvals` (ya existía)
- [x] **Sync productos desde Shopify** — `POST /sync-shopify` + UI; upsert a `publications`; listo con `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_ACCESS_TOKEN` en `.env`

## 4. Datos e infraestructura

- [x] **MongoDB Atlas DB `auditor_shopify_ml`** — URI en `.env`; `connectDb` fuerza `DB_NAME=auditor_shopify_ml`; health reporta `dbName` (ya existía + candado)
- [x] **Colecciones del dominio + seed demo** — indexes en `db.js`; `pnpm seed` (roles, criteria, 4 pubs demo + audit); idempotente (ya existía)
- [x] **Monorepo pnpm** — `pnpm-workspace.yaml` → `apps/*`; `@auditor/api` + `@auditor/web`; scripts raíz `dev` / `dev:api` / `dev:web` / `seed` (ya existía)
- [x] **UI responsive (prioridad móvil)** — viewport + grids/stacks `sm:`/`lg:`; listado cards móvil / tabla desktop; admin usuarios igual; header wrap (ya existía + hueco admin)
- [x] **`.env` / puertos configurables** — `PORT`/`WEB_PORT`/`PUBLIC_API_URL`/`CORS_ORIGIN`; Vite `strictPort:false`; CORS localhost:*; default API 3002; hint si EADDRINUSE (ya existía + ajuste)

## Fuera de alcance (no construir)

- [ ] ~~Auth Google~~
- [ ] ~~Envío de correo~~
- [ ] ~~Sync real a Mercado Libre~~
- [ ] ~~Escritura automática en Shopify~~

---

### Cómo verificar el ítem actual

1. API en `PORT` del `.env` (ej. `3002`) → `curl http://localhost:PORT/health`
2. Debe responder `project: auditor-shopify-ml` y `dbName: auditor_shopify_ml`
3. Front en `WEB_PORT` (o el que Vite asigne si está ocupado)
