import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: Number(process.env.PORT || 3002),
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresDays: Number(process.env.JWT_EXPIRES_DAYS || 7),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  shopifyStoreDomain: (process.env.SHOPIFY_STORE_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/$/, ''),
  shopifyAccessToken: process.env.SHOPIFY_ACCESS_TOKEN || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini'
};

export const COOKIE_NAME = 'auditor_token';

export const SYSTEM_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};
