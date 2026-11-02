<script>
  import { onMount } from 'svelte';
  import { api, formatDate } from '$lib/api.js';

  let roles = $state([]);
  let users = $state([]);
  let loading = $state(true);
  let error = $state('');
  let busy = $state('');
  let tab = $state('roles');

  let newRole = $state({ name: '', description: '', permissions: 'audit' });

  async function load() {
    loading = true;
    error = '';
    try {
      const [r, u] = await Promise.all([api.adminRoles(), api.adminUsers()]);
      roles = r.items || [];
      users = u.items || [];
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function createRole(e) {
    e.preventDefault();
    busy = 'create';
    error = '';
    try {
      await api.createRole({
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean)
      });
      newRole = { name: '', description: '', permissions: 'audit' };
      await load();
    } catch (err) {
      error = err.message;
    } finally {
      busy = '';
    }
  }

  async function removeRole(id) {
    if (!confirm('¿Eliminar este rol?')) return;
    busy = id;
    try {
      await api.deleteRole(id);
      await load();
    } catch (err) {
      error = err.message;
    } finally {
      busy = '';
    }
  }

  async function changeUserRole(userId, roleId) {
    busy = userId;
    error = '';
    try {
      await api.updateUser(userId, { roleId });
      await load();
    } catch (err) {
      error = err.message;
    } finally {
      busy = '';
    }
  }

  async function toggleActive(u) {
    busy = u.id;
    error = '';
    try {
      await api.updateUser(u.id, { isActive: !u.isActive });
      await load();
    } catch (err) {
      error = err.message;
    } finally {
      busy = '';
    }
  }

  onMount(load);
</script>

<section class="space-y-5">
  <div>
    <h1 class="font-display text-2xl sm:text-3xl text-ink-950">Administración</h1>
    <p class="mt-1 text-sm text-ink-500">Roles del sistema y usuarios. Por ahora: <strong>admin</strong> y <strong>user</strong>.</p>
  </div>

  <div class="flex gap-2">
    <button class={tab === 'roles' ? 'btn-primary' : 'btn-secondary'} onclick={() => (tab = 'roles')}>Roles</button>
    <button class={tab === 'users' ? 'btn-primary' : 'btn-secondary'} onclick={() => (tab = 'users')}>Usuarios</button>
  </div>

  {#if error}
    <p class="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{error}</p>
  {/if}

  {#if loading}
    <p class="text-sm text-ink-500">Cargando…</p>
  {:else if tab === 'roles'}
    <div class="grid lg:grid-cols-2 gap-4">
      <div class="card-panel p-4 space-y-3">
        <h2 class="font-display text-lg">Roles existentes</h2>
        {#each roles as role}
          <div class="rounded-lg border border-ink-100 p-3">
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="font-semibold text-sm">{role.name}</p>
                <p class="text-xs text-ink-500">slug: {role.slug} {role.isSystem ? '· sistema' : ''}</p>
                <p class="text-sm text-ink-700 mt-1">{role.description || '—'}</p>
                <p class="text-xs mt-1">Permisos: {(role.permissions || []).join(', ') || '—'}</p>
              </div>
              {#if !role.isSystem}
                <button class="btn-danger text-xs" disabled={busy === role.id} onclick={() => removeRole(role.id)}>Eliminar</button>
              {/if}
            </div>
          </div>
        {/each}
      </div>

      <div class="card-panel p-4 space-y-3">
        <h2 class="font-display text-lg">Crear rol</h2>
        <p class="text-xs text-ink-500">Los roles de sistema (admin/user) no se pueden eliminar. Puedes crear roles adicionales si los necesitas después.</p>
        <form class="space-y-3" onsubmit={createRole}>
          <label class="block text-sm">
            <span class="font-medium">Nombre</span>
            <input class="input mt-1" required bind:value={newRole.name} placeholder="Ej. Auditor" />
          </label>
          <label class="block text-sm">
            <span class="font-medium">Descripción</span>
            <input class="input mt-1" bind:value={newRole.description} />
          </label>
          <label class="block text-sm">
            <span class="font-medium">Permisos (separados por coma)</span>
            <input class="input mt-1" bind:value={newRole.permissions} placeholder="audit, approve" />
          </label>
          <button class="btn-primary" type="submit" disabled={busy === 'create'}>
            {busy === 'create' ? 'Creando…' : 'Crear rol'}
          </button>
        </form>
      </div>
    </div>
  {:else}
    <div class="sm:hidden space-y-3">
      {#each users as u}
        <div class="card-panel p-4 space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="font-semibold text-sm truncate">{u.name}</p>
              <p class="text-xs text-ink-500 truncate">{u.email}</p>
              <p class="text-xs text-ink-500 mt-1">Alta {formatDate(u.createdAt)}</p>
            </div>
            <span class={u.isActive ? 'chip bg-ok-soft text-ok shrink-0' : 'chip bg-danger-soft text-danger shrink-0'}>
              {u.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <label class="block text-sm">
            <span class="text-xs font-medium text-ink-500">Rol</span>
            <select
              class="input mt-1"
              value={u.roleId}
              disabled={busy === u.id}
              onchange={(e) => changeUserRole(u.id, e.currentTarget.value)}
            >
              {#each roles as role}
                <option value={role.id}>{role.name}</option>
              {/each}
            </select>
          </label>
          <button class="btn-secondary text-xs w-full" disabled={busy === u.id} onclick={() => toggleActive(u)}>
            {u.isActive ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      {/each}
    </div>

    <div class="hidden sm:block card-panel overflow-x-auto">
      <table class="w-full text-sm text-left">
        <thead class="text-xs uppercase text-ink-500 border-b border-ink-100">
          <tr>
            <th class="px-4 py-3">Usuario</th>
            <th class="px-4 py-3">Rol</th>
            <th class="px-4 py-3">Estado</th>
            <th class="px-4 py-3">Alta</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {#each users as u}
            <tr class="border-b border-ink-100/70">
              <td class="px-4 py-3">
                <p class="font-medium">{u.name}</p>
                <p class="text-xs text-ink-500">{u.email}</p>
              </td>
              <td class="px-4 py-3">
                <select
                  class="input w-auto"
                  value={u.roleId}
                  disabled={busy === u.id}
                  onchange={(e) => changeUserRole(u.id, e.currentTarget.value)}
                >
                  {#each roles as role}
                    <option value={role.id}>{role.name}</option>
                  {/each}
                </select>
              </td>
              <td class="px-4 py-3">
                <span class={u.isActive ? 'chip bg-ok-soft text-ok' : 'chip bg-danger-soft text-danger'}>
                  {u.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td class="px-4 py-3 text-ink-500 whitespace-nowrap">{formatDate(u.createdAt)}</td>
              <td class="px-4 py-3">
                <button class="btn-secondary text-xs" disabled={busy === u.id} onclick={() => toggleActive(u)}>
                  {u.isActive ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</section>
