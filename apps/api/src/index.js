import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { assertSafeNode } from './nodeVersionGuard.js';
import { config } from './config.js';
import { connectDb } from './db.js';
import { ensureDefaultRoles } from './services/roles.js';
import { shopifyConfigured } from './services/shopify.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import publicationsRouter from './routes/publications.js';

assertSafeNode();

if (!config.jwtSecret) {
  console.error('Falta JWT_SECRET en .env / variables de entorno');
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = new Set(
  String(config.corsOrigin)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
);

function originAllowed(origin) {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  // Dev: Vite puede usar 5173, 5174…
  if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return true;
  // Preview/prod en Vercel (web y API en dominios *.vercel.app)
  if (/^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.vercel\.app$/i.test(origin)) return true;
  return false;
}

app.use(
  cors({
    origin(origin, cb) {
      if (originAllowed(origin)) return cb(null, true);
      return cb(new Error(`CORS bloqueado: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

let bootPromise = null;
async function ensureBoot() {
  if (!bootPromise) {
    bootPromise = (async () => {
      await connectDb();
      await ensureDefaultRoles();
    })().catch((err) => {
      bootPromise = null;
      throw err;
    });
  }
  return bootPromise;
}

// En Vercel (serverless) la DB se abre en el primer request / cold start.
app.use(async (_req, _res, next) => {
  try {
    await ensureBoot();
    next();
  } catch (err) {
    next(err);
  }
});

app.get('/health', async (_req, res) => {
  let dbName = null;
  let users = 0;
  try {
    const { getDb } = await import('./db.js');
    const db = getDb();
    dbName = db.databaseName;
    users = await db.collection('users').countDocuments();
  } catch {
    /* ignore */
  }
  res.json({
    ok: true,
    project: 'auditor-shopify-ml',
    port: config.port,
    dbName,
    users,
    shopifyConfigured: shopifyConfigured(),
    openaiConfigured: Boolean(config.openaiApiKey),
    vercel: Boolean(process.env.VERCEL)
  });
});

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/publications', publicationsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Error interno' });
});

// Local / Node clásico: escucha puerto. En Vercel solo se exporta `app`.
const isServerless = Boolean(process.env.VERCEL);
if (!isServerless) {
  await ensureBoot();
  const server = app.listen(config.port, () => {
    console.log(`API escuchando en http://localhost:${config.port}`);
    console.log(`CORS origin: ${config.corsOrigin}`);
    console.log(`Shopify: ${shopifyConfigured() ? 'configurado' : 'pendiente'}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `Puerto ${config.port} ocupado. Cambia PORT (y PUBLIC_API_URL) en .env; no mates otros proyectos.`
      );
      process.exit(1);
    }
    throw err;
  });
}

export default app;
