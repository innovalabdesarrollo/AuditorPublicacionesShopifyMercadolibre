<script>
  import { goto } from '$app/navigation';
  import { login } from '$lib/auth.js';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let busy = $state(false);

  async function submit(e) {
    e.preventDefault();
    busy = true;
    error = '';
    try {
      await login(email, password);
      goto('/');
    } catch (err) {
      error = err.message;
    } finally {
      busy = false;
    }
  }
</script>

<div class="mx-auto max-w-md">
  <div class="card-panel p-6 sm:p-8 space-y-5">
    <div>
      <h1 class="font-display text-2xl text-ink-950">Iniciar sesión</h1>
      <p class="text-sm text-ink-500 mt-1">Accede al auditor de publicaciones.</p>
    </div>

    <form class="space-y-3" onsubmit={submit}>
      <label class="block text-sm">
        <span class="text-ink-700 font-medium">Email</span>
        <input class="input mt-1" type="email" required autocomplete="email" bind:value={email} />
      </label>
      <label class="block text-sm">
        <span class="text-ink-700 font-medium">Contraseña</span>
        <input class="input mt-1" type="password" required minlength="8" autocomplete="current-password" bind:value={password} />
      </label>

      {#if error}
        <p class="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{error}</p>
      {/if}

      <button class="btn-primary w-full" type="submit" disabled={busy}>
        {busy ? 'Entrando…' : 'Entrar'}
      </button>
    </form>

    <p class="text-sm text-ink-500 text-center">
      ¿Sin cuenta?
      <a href="/registro" class="text-accent font-semibold">Regístrate</a>
    </p>
  </div>
</div>
