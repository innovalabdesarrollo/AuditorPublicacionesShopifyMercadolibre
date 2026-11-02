<script>
  import { onMount } from 'svelte';
  import { api, statusLabel, statusClass, scoreColor, formatDate } from '$lib/api.js';

  let items = $state([]);
  let loading = $state(true);
  let error = $state('');
  let shopifyConfigured = $state(false);
  let busy = $state('');

  let filters = $state({
    status: '',
    minScore: '',
    maxScore: '',
    severity: '',
    category: '',
    q: '',
    sort: 'updatedAt',
    order: 'desc'
  });

  async function load() {
    loading = true;
    error = '';
    try {
      const data = await api.listPublications(filters);
      items = data.items || [];
      shopifyConfigured = data.shopifyConfigured;
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function syncShopify() {
    busy = 'sync';
    error = '';
    try {
      await api.syncShopify();
      await api.auditAll();
      await load();
    } catch (e) {
      error = e.message;
    } finally {
      busy = '';
    }
  }

  async function auditAll() {
    busy = 'audit';
    error = '';
    try {
      await api.auditAll();
      await load();
    } catch (e) {
      error = e.message;
    } finally {
      busy = '';
    }
  }

  onMount(load);
</script>

<section class="space-y-5">
  <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 class="font-display text-2xl sm:text-3xl text-ink-950">Publicaciones auditadas</h1>
      <p class="mt-1 text-sm text-ink-500 max-w-xl">
        Revisa calificación, estado y errores antes de sincronizar con Mercado Libre.
      </p>
    </div>
    <div class="flex flex-wrap gap-2">
      <button class="btn-secondary" disabled={!!busy} onclick={auditAll}>
        {busy === 'audit' ? 'Auditando…' : 'Re-auditar todo'}
      </button>
      <button class="btn-primary" disabled={!!busy || !shopifyConfigured} onclick={syncShopify}>
        {busy === 'sync' ? 'Sincronizando…' : 'Sync Shopify'}
      </button>
    </div>
  </div>

  {#if !shopifyConfigured}
    <div class="card-panel px-4 py-3 text-sm text-ink-700 border-l-4 border-warn">
      Shopify sin configurar. Pega en el <code class="text-xs bg-ink-100 px-1 rounded">.env</code>:
      <code class="text-xs bg-ink-100 px-1 rounded">SHOPIFY_STORE_DOMAIN</code> y
      <code class="text-xs bg-ink-100 px-1 rounded">SHOPIFY_ACCESS_TOKEN</code> (scope <code class="text-xs">read_products</code>), luego reinicia el API.
    </div>
  {/if}

  <div class="card-panel p-3 sm:p-4">
    <form
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2"
      onsubmit={(e) => {
        e.preventDefault();
        load();
      }}
    >
      <input class="col-span-2 input" placeholder="Buscar título / SKU" bind:value={filters.q} />
      <select class="input" bind:value={filters.status}>
        <option value="">Estado (todos)</option>
        <option value="pendiente">Pendiente</option>
        <option value="requiere_mejoras">Requiere mejoras</option>
        <option value="requiere_correcciones">Requiere correcciones</option>
        <option value="lista">Lista</option>
        <option value="aprobada_para_sync">Aprobada para sync</option>
      </select>
      <select class="input" bind:value={filters.severity}>
        <option value="">Severidad</option>
        <option value="critica">Crítica</option>
        <option value="alta">Alta</option>
        <option value="media">Media</option>
        <option value="baja">Baja</option>
      </select>
      <input class="input" type="number" min="0" max="100" placeholder="Score mín" bind:value={filters.minScore} />
      <input class="input" type="number" min="0" max="100" placeholder="Score máx" bind:value={filters.maxScore} />
      <button class="btn-primary col-span-2 sm:col-span-1" type="submit">Filtrar</button>
    </form>
  </div>

  {#if error}
    <p class="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{error}</p>
  {/if}

  {#if loading}
    <p class="text-sm text-ink-500">Cargando…</p>
  {:else if !items.length}
    <div class="card-panel p-8 text-center text-sm text-ink-500">
      No hay publicaciones. Ejecuta <code class="bg-ink-100 px-1 rounded">pnpm seed</code> o Sync Shopify.
    </div>
  {:else}
    <div class="sm:hidden space-y-3">
      {#each items as p}
        <a href={`/publicaciones/${p.id}`} class="card-panel block p-4 hover:border-accent/40 transition">
          <div class="flex items-start justify-between gap-2">
            <h2 class="font-semibold text-sm leading-snug line-clamp-2">{p.title}</h2>
            <span class={`font-display text-xl ${scoreColor(p.latestQualityScore)}`}>{p.latestQualityScore ?? '—'}</span>
          </div>
          <p class="mt-1 text-xs text-ink-500">SKU: {p.sku || '—'} · Errores: {p.errorCount ?? 0}</p>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <span class={statusClass(p.publicationStatus)}>{statusLabel(p.publicationStatus)}</span>
            <span class="text-xs text-ink-500">{formatDate(p.updatedAt)}</span>
          </div>
        </a>
      {/each}
    </div>

    <div class="hidden sm:block card-panel overflow-x-auto">
      <table class="w-full text-sm text-left">
        <thead class="text-xs uppercase text-ink-500 border-b border-ink-100">
          <tr>
            <th class="px-4 py-3 font-semibold">Producto</th>
            <th class="px-4 py-3 font-semibold">SKU</th>
            <th class="px-4 py-3 font-semibold">Score</th>
            <th class="px-4 py-3 font-semibold">Estado</th>
            <th class="px-4 py-3 font-semibold">Errores</th>
            <th class="px-4 py-3 font-semibold">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {#each items as p}
            <tr class="border-b border-ink-100/70 hover:bg-accent-soft/40 transition">
              <td class="px-4 py-3">
                <a href={`/publicaciones/${p.id}`} class="font-medium text-ink-950 hover:text-accent line-clamp-2">{p.title}</a>
                <p class="text-xs text-ink-500">{p.productCategory}</p>
              </td>
              <td class="px-4 py-3 text-ink-700">{p.sku || '—'}</td>
              <td class={`px-4 py-3 font-display text-lg ${scoreColor(p.latestQualityScore)}`}>{p.latestQualityScore ?? '—'}</td>
              <td class="px-4 py-3"><span class={statusClass(p.publicationStatus)}>{statusLabel(p.publicationStatus)}</span></td>
              <td class="px-4 py-3">{p.errorCount ?? 0}</td>
              <td class="px-4 py-3 text-ink-500 whitespace-nowrap">{formatDate(p.updatedAt)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</section>
