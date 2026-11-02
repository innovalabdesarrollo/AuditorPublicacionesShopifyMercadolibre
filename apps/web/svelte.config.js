import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      // Security releases oct 2026: ≥24.22.1 / ≥22.23.4 (Vercel toma el patch de la línea)
      runtime: 'nodejs24.x'
    })
  }
};

export default config;
