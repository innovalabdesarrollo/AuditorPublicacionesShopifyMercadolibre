<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { initAuth, user, authReady, logout, isAdmin } from '$lib/auth.js';

  let { children } = $props();

  const publicPaths = ['/login', '/registro'];

  onMount(async () => {
    await initAuth();
  });

  $effect(() => {
    if (!$authReady) return;
    const path = $page.url.pathname;
    const isPublic = publicPaths.some((p) => path === p || path.startsWith(p + '/'));
    if (!$user && !isPublic) {
      goto('/login');
    } else if ($user && isPublic) {
      goto('/');
    } else if ($user && path.startsWith('/admin') && $user.roleSlug !== 'admin') {
      goto('/');
    }
  });

  async function handleLogout() {
    await logout();
    goto('/login');
  }
</script>

{#if !$authReady}
  <div class="min-h-dvh grid place-items-center text-sm text-ink-500">Cargando sesión…</div>
{:else}
  <div class="min-h-dvh flex flex-col">
    {#if $user}
      <header class="border-b border-ink-100/80 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div class="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <a href="/" class="min-w-0 flex-1">
            <p class="font-display text-lg sm:text-xl text-ink-950 leading-tight truncate">
              Auditor Shopify → ML
            </p>
            <p class="text-xs text-ink-500 truncate">{$user.name} · {$user.roleName || $user.roleSlug}</p>
          </a>
          <nav class="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a href="/" class="btn-secondary text-xs sm:text-sm px-2.5 sm:px-3.5">Publicaciones</a>
            {#if $isAdmin}
              <a href="/admin" class="btn-secondary text-xs sm:text-sm px-2.5 sm:px-3.5">Admin</a>
            {/if}
            <button class="btn-secondary text-xs sm:text-sm px-2.5 sm:px-3.5" onclick={handleLogout}>Salir</button>
          </nav>
        </div>
      </header>
    {/if}

    <main class="flex-1 mx-auto w-full max-w-6xl px-4 py-5 sm:py-8">
      {@render children()}
    </main>

    <footer class="border-t border-ink-100/80 py-4 text-center text-xs text-ink-500">
      MVP Innovalab · Zona horaria México
    </footer>
  </div>
{/if}
