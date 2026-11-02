import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export default defineConfig(({ mode }) => {
  const env = {
    ...loadEnv(mode, rootDir, ''),
    ...loadEnv(mode, path.resolve(rootDir, 'apps/api'), ''),
    ...loadEnv(mode, path.resolve(rootDir, 'apps/web'), '')
  };
  const apiPort = env.PORT || '3002';
  const apiTarget = env.PUBLIC_API_URL || `http://localhost:${apiPort}`;
  const webPort = Number(env.WEB_PORT || 5173);

  return {
    plugins: [sveltekit()],
    server: {
      port: webPort,
      strictPort: false, // si está ocupado, Vite usa el siguiente libre (no mata otros)
      proxy: {
        '/api': apiTarget,
        '/health': apiTarget
      }
    }
  };
});
