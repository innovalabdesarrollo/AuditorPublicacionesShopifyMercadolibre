import { config } from '../config.js';

/** Dominio listo para API/Admin: acepta "tienda" o "tienda.myshopify.com". */
export function shopifyStoreHost() {
  const raw = (config.shopifyStoreDomain || '').trim();
  if (!raw) return '';
  return raw.includes('.') ? raw : `${raw}.myshopify.com`;
}

export function shopifyConfigured() {
  return Boolean(shopifyStoreHost() && config.shopifyAccessToken);
}

export function shopifyAdminProductUrl(shopifyProductId) {
  const store = shopifyStoreHost();
  if (!store || !shopifyProductId) return null;
  return `https://${store}/admin/products/${shopifyProductId}`;
}

async function shopifyFetch(pathname) {
  if (!shopifyConfigured()) {
    throw new Error(
      'Shopify no configurado. Pega SHOPIFY_STORE_DOMAIN y SHOPIFY_ACCESS_TOKEN en el .env (raíz o apps/api).'
    );
  }
  const url = `https://${shopifyStoreHost()}/admin/api/2024-10${pathname}`;
  const res = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': config.shopifyAccessToken,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify API ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

function mapShopifyProduct(p) {
  const variant = (p.variants && p.variants[0]) || {};
  return {
    shopifyProductId: String(p.id),
    title: p.title || '',
    description: p.body_html || '',
    productCategory: p.product_type || p.vendor || 'general',
    productType: p.product_type || '',
    brand: p.vendor || '',
    model: variant.sku || '',
    sku: variant.sku || '',
    packageContents: '',
    specifications: {
      peso: variant.weight ? `${variant.weight} ${variant.weight_unit || ''}`.trim() : undefined
    },
    images: (p.images || []).map((img) => img.src).filter(Boolean),
    variants: (p.variants || []).map((v) => ({
      id: String(v.id),
      title: v.title,
      sku: v.sku,
      barcode: v.barcode
    })),
    shopifyAdminUrl: shopifyAdminProductUrl(p.id)
  };
}

export async function fetchShopifyProducts({ limit = 50 } = {}) {
  const data = await shopifyFetch(`/products.json?limit=${Math.min(limit, 250)}`);
  return (data.products || []).map(mapShopifyProduct);
}

export async function fetchShopifyProduct(shopifyProductId) {
  const data = await shopifyFetch(`/products/${shopifyProductId}.json`);
  return mapShopifyProduct(data.product);
}
