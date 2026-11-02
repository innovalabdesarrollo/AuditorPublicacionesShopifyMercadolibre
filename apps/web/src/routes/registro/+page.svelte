<script>
  import { goto } from '$app/navigation';
  import { register } from '$lib/auth.js';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let confirm = $state('');
  let error = $state('');
  let busy = $state(false);

  async function submit(e) {
    e.preventDefault();
    busy = true;
    error = '';
    try {
      if (password !== confirm) throw new Error('Las contraseñas no coinciden');
      if (password.length < 8) throw new Error('Mínimo 8 caracteres');
      await register(name, email, password);
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
      <h1 class="font-display text-2xl text-ink-950">Crear cuenta</h1>
      <p class="text-sm text-ink-500 mt-1">
        El primer usuario registrado será <strong>admin</strong>; los siguientes serán <strong>user</strong>.
      </p>
    </div>

    <form class="space-y-3" onsubmit={submit}>
      <label class="block text-sm">
        <span class="text-ink-700 font-medium">Nombre</span>
        <input class="input mt-1" type="text" required autocomplete="name" bind:value={name} />
      </label>
      <label class="block text-sm">
        <span class="text-ink-700 font-medium">Email</span>
        <input class="input mt-1" type="email" required autocomplete="email" bind:value={email} />
      </label>
      <label class="block text-sm">
        <span class="text-ink-700 font-medium">Contraseña</span>
        <input class="input mt-1" type="password" required minlength="8" autocomplete="new-password" bind:value={password} />
      </label>
      <label class="block text-sm">
        <span class="text-ink-700 font-medium">Confirmar contraseña</span>
        <input class="input mt-1" type="password" required minlength="8" autocomplete="new-password" bind:value={confirm} />
      </label>

      {#if error}
        <p class="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{error}</p>
      {/if}

      <button class="btn-primary w-full" type="submit" disabled={busy}>
        {busy ? 'Creando…' : 'Registrarme'}
      </button>
    </form>

    <p class="text-sm text-ink-500 text-center">
      ¿Ya tienes cuenta?
      <a href="/login" class="text-accent font-semibold">Inicia sesión</a>
    </p>
  </div>
</div>
