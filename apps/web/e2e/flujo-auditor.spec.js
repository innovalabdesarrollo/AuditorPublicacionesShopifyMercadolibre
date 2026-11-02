import { test, expect } from '@playwright/test';

const password = 'Playwright1!';
const email = `pw-${Date.now()}@test.local`;

async function login(page, userEmail = email) {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email' }).fill(userEmail);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /entrar/i }).click();
  await expect(page.getByRole('heading', { name: /publicaciones auditadas/i })).toBeVisible();
}

test.describe.serial('Flujo auditor Shopify→ML', () => {
  test('redirige a login si no hay sesión', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('registro y llega al listado', async ({ page }) => {
    await page.goto('/registro');
    await page.getByRole('textbox', { name: 'Nombre' }).fill('Playwright User');
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    const pw = page.locator('input[type="password"]');
    await pw.nth(0).fill(password);
    await pw.nth(1).fill(password);
    await page.getByRole('button', { name: /registrarme/i }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: /publicaciones auditadas/i })).toBeVisible();
    await expect(page.getByText(/auditor shopify/i).first()).toBeVisible();
  });

  test('logout y login de nuevo', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: /salir/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await login(page);
  });

  test('abre detalle, ve score y puede copiar título recomendado', async ({ page }) => {
    await login(page);

    // Evitar cards móvil (sm:hidden): solo el link visible del listado desktop
    const link = page.locator('a[href^="/publicaciones/"]:visible').first();
    await expect(link).toBeVisible({ timeout: 15_000 });
    await link.click();

    await expect(page).toHaveURL(/\/publicaciones\//);
    await expect(page.getByText(/calificación/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /nueva auditoría/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /aprobar sync ml|ya aprobada/i })).toBeVisible();

    const copyBtn = page.getByRole('button', { name: /^copiar$/i });
    if (await copyBtn.count()) {
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
      await copyBtn.click();
      await expect(page.getByRole('button', { name: /copiado/i })).toBeVisible();
    }
  });

  test('filtros del listado responden', async ({ page }) => {
    await login(page);
    await page.locator('select').first().selectOption('requiere_correcciones');
    await page.getByRole('button', { name: /filtrar/i }).click();
    await expect(page.getByRole('heading', { name: /publicaciones auditadas/i })).toBeVisible();
  });
});
