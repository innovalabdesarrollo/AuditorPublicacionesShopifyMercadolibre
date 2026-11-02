<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/auth.js';
  import { api, statusLabel, statusClass, severityClass, scoreColor, formatDate } from '$lib/api.js';

  let { data } = $props();
  const id = $derived(data.id);

  let report = $state(null);
  let loading = $state(true);
  let error = $state('');
  let busy = $state('');
  let copied = $state(false);
  let showForce = $state(false);
  let forceReason = $state('');
  let compare = $state(null);
  let compareA = $state('');
  let compareB = $state('');

  async function load() {
    loading = true;
    error = '';
    try {
      report = await api.getReport(id);
      const audits = report.audits || [];
      if (audits.length >= 2) {
        compareA = audits[1].id;
        compareB = audits[0].id;
      }
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function reaudit() {
    busy = 'audit';
    error = '';
    try {
      report = await api.audit(id);
      compare = null;
    } catch (e) {
      error = e.message;
    } finally {
      busy = '';
    }
  }

  async function approve(force = false) {
    busy = 'approve';
    error = '';
    try {
      await api.approve(id, {
        approvedBy: $user?.email || 'responsable_catalogo',
        force,
        decisionReason: forceReason
      });
      showForce = false;
      forceReason = '';
      await load();
    } catch (e) {
      if (e.status === 409) {
        showForce = true;
        error = e.message;
      } else error = e.message;
    } finally {
      busy = '';
    }
  }

  async function copyTitle() {
    const t = report?.audit?.recommendedTitle;
    if (!t) return;
    await navigator.clipboard.writeText(t);
    copied = true;
    setTimeout(() => (copied = false), 1600);
  }

  async function runCompare() {
    if (!compareA || !compareB) return;
    busy = 'compare';
    try {
      compare = await api.compare(id, compareA, compareB);
    } catch (e) {
      error = e.message;
    } finally {
      busy = '';
    }
  }

  onMount(load);
</script>

{#if loading}
  <p class="text-sm text-ink-500">Cargando reporte…</p>
{:else if error && !report}
  <p class="text-sm text-danger">{error}</p>
{:else if report}
  {@const p = report.publication}
  {@const a = report.audit}
  {@const findings = report.findings || []}
  {@const recs = report.recommendations || []}
  {@const criticals = findings.filter((f) => f.severity === 'critica')}

  <div class="space-y-5">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <a href="/" class="text-xs text-accent font-semibold">← Publicaciones</a>
        <h1 class="mt-1 font-display text-2xl sm:text-3xl text-ink-950 leading-tight">{p.title}</h1>
        <p class="mt-1 text-sm text-ink-500">SKU {p.sku || '—'} · Shopify #{p.shopifyProductId}</p>
      </div>
      <div class="flex flex-wrap gap-2 shrink-0">
        {#if p.shopifyAdminUrl}
          <a class="btn-secondary" href={p.shopifyAdminUrl} target="_blank" rel="noopener">Editar en Shopify</a>
        {/if}
        <button class="btn-secondary" disabled={!!busy} onclick={reaudit}>{busy === 'audit' ? 'Auditando…' : 'Nueva auditoría'}</button>
        <button class="btn-primary" disabled={!!busy || p.approvedForSync} onclick={() => approve(false)}>
          {p.approvedForSync ? 'Ya aprobada' : 'Aprobar sync ML'}
        </button>
      </div>
    </div>

    {#if error}
      <p class="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{error}</p>
    {/if}

    {#if !report.openaiConfigured || a?.engine === 'rules+openai-demo'}
      <div class="card-panel px-4 py-3 text-sm text-ink-700 border-l-4 border-accent">
        <p class="font-semibold text-ink-950">Vista previa del aporte OpenAI</p>
        <p class="mt-1">
          Sin <code class="text-xs bg-ink-100 px-1 rounded">OPENAI_API_KEY</code> el motor usa reglas + un
          <strong>demo IA</strong> (ítems marcados “[Demo IA]”). Con la key del cliente, esos textos se sustituyen por análisis real.
        </p>
        {#if a?.engine}
          <p class="mt-1 text-xs text-ink-500">Motor de esta auditoría: <code class="bg-ink-100 px-1 rounded">{a.engine}</code></p>
        {/if}
      </div>
    {:else if a?.engine}
      <p class="text-xs text-ink-500">Motor: <code class="bg-ink-100 px-1 rounded">{a.engine}</code></p>
    {/if}

    {#if showForce}
      <div class="card-panel p-4 border-l-4 border-danger space-y-3">
        <p class="text-sm font-semibold text-danger">Errores críticos. Justifica la aprobación excepcional.</p>
        <textarea class="input" rows="2" bind:value={forceReason} placeholder="Justificación…"></textarea>
        <button class="btn-danger" disabled={!!busy || !forceReason.trim()} onclick={() => approve(true)}>Forzar aprobación</button>
      </div>
    {/if}

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="card-panel p-4">
        <p class="text-xs text-ink-500 uppercase">Calificación</p>
        <p class={`font-display text-4xl mt-1 ${scoreColor(a?.qualityScore)}`}>{a?.qualityScore ?? '—'}</p>
      </div>
      <div class="card-panel p-4 col-span-1 sm:col-span-2">
        <p class="text-xs text-ink-500 uppercase">Estado</p>
        <p class="mt-2"><span class={statusClass(a?.auditStatus || p.publicationStatus)}>{statusLabel(a?.auditStatus || p.publicationStatus)}</span></p>
        <p class="mt-2 text-xs text-ink-500">{formatDate(a?.auditedAt)}</p>
      </div>
      <div class="card-panel p-4">
        <p class="text-xs text-ink-500 uppercase">Críticos</p>
        <p class="font-display text-4xl mt-1 text-danger">{criticals.length}</p>
      </div>
    </div>

    <div class="card-panel p-4 space-y-3">
      <h2 class="font-display text-lg">Título</h2>
      <div>
        <p class="text-xs text-ink-500">Actual ({(p.title || '').length})</p>
        <p class="text-sm mt-0.5">{p.title}</p>
      </div>
      <div class="rounded-lg bg-accent-soft p-3 flex items-start justify-between gap-2">
        <div>
          <p class="text-xs text-accent font-semibold">Recomendado ML ({(a?.recommendedTitle || '').length}/60)</p>
          <p class="text-sm mt-0.5 font-medium">{a?.recommendedTitle || '—'}</p>
        </div>
        <button class="btn-secondary text-xs shrink-0" onclick={copyTitle}>{copied ? 'Copiado' : 'Copiar'}</button>
      </div>
    </div>

    <div class="card-panel p-4 space-y-3">
      <h2 class="font-display text-lg">Hallazgos ({findings.length})</h2>
      {#each findings as f}
        <div class="rounded-lg border border-ink-100 p-3">
          <div class="flex flex-wrap gap-2">
            <span class={severityClass(f.severity)}>{f.severity}</span>
            <span class="chip bg-ink-100 text-ink-700">{f.findingType}</span>
          </div>
          <p class="mt-1.5 font-semibold text-sm">{f.title}</p>
          <p class="text-sm text-ink-700">{f.description}</p>
          {#if f.suggestedAction}<p class="text-xs text-accent mt-1">→ {f.suggestedAction}</p>{/if}
        </div>
      {:else}
        <p class="text-sm text-ok">Sin hallazgos.</p>
      {/each}
    </div>

    <div class="card-panel p-4 space-y-3">
      <h2 class="font-display text-lg">Revisión de descripción</h2>
      <div class="grid sm:grid-cols-2 gap-3 text-sm">
        {#each [['corregir', 'Corregir'], ['eliminar', 'Eliminar'], ['aclarar', 'Aclarar'], ['agregar', 'Agregar']] as [key, label]}
          <div>
            <p class="text-xs font-semibold uppercase text-ink-500">{label}</p>
            {#if (a?.descriptionReview?.[key] || []).length}
              <ul class="mt-1 space-y-1">
                {#each a.descriptionReview[key] as item}
                  <li>• {item}</li>
                {/each}
              </ul>
            {:else}
              <p class="text-ink-500 mt-1">—</p>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <div class="grid sm:grid-cols-2 gap-3">
      <div class="card-panel p-4 space-y-2">
        <h2 class="font-display text-lg">Información faltante</h2>
        {#each a?.missingInformation || [] as m}
          <p class="text-sm"><strong>{m.field}</strong> — {m.reason}</p>
        {:else}
          <p class="text-sm text-ink-500">Ninguna.</p>
        {/each}
      </div>
      <div class="card-panel p-4 space-y-2">
        <h2 class="font-display text-lg">Preguntas potenciales</h2>
        {#each a?.potentialBuyerQuestions || [] as q}
          <div class="text-sm">
            <p class="font-medium">{q.question}</p>
            <p class="text-xs text-ink-500">{q.clarificationNeeded}</p>
          </div>
        {:else}
          <p class="text-sm text-ink-500">Ninguna.</p>
        {/each}
      </div>
    </div>

    <div class="card-panel p-4 space-y-3">
      <h2 class="font-display text-lg">Recomendaciones</h2>
      {#each recs as r}
        <div class="rounded-lg bg-ink-100/60 px-3 py-2 text-sm">
          <span class="chip bg-white text-ink-700">{r.recommendationType}</span>
          <p class="mt-1">{r.description}</p>
          {#if r.suggestedValue}<p class="text-xs mt-1 font-mono bg-white rounded px-2 py-1 inline-block">{r.suggestedValue}</p>{/if}
        </div>
      {/each}
    </div>

    <div class="card-panel p-4 space-y-3">
      <h2 class="font-display text-lg">Seguimiento</h2>
      {#if (report.audits || []).length < 2}
        <p class="text-sm text-ink-500">Se necesitan 2+ auditorías para comparar.</p>
      {:else}
        <div class="flex flex-wrap gap-2 items-end">
          <select class="input w-auto" bind:value={compareA}>
            {#each report.audits as au}<option value={au.id}>{formatDate(au.auditedAt)} · {au.qualityScore}</option>{/each}
          </select>
          <select class="input w-auto" bind:value={compareB}>
            {#each report.audits as au}<option value={au.id}>{formatDate(au.auditedAt)} · {au.qualityScore}</option>{/each}
          </select>
          <button class="btn-secondary" disabled={!!busy} onclick={runCompare}>Comparar</button>
        </div>
        {#if compare}
          <div class="grid sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p class="text-xs font-semibold text-ok uppercase">Resueltos</p>
              {#each compare.resolved as f}<p>• {f.title}</p>{/each}
            </div>
            <div>
              <p class="text-xs font-semibold text-warn uppercase">Pendientes</p>
              {#each compare.pending as f}<p>• {f.title}</p>{/each}
            </div>
            <div>
              <p class="text-xs font-semibold text-danger uppercase">Nuevos</p>
              {#each compare.newFindings as f}<p>• {f.title}</p>{/each}
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </div>
{/if}
