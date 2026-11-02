import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveCategoryKey,
  stripHtml,
  extractFieldHints
} from '../src/services/categoryRules.js';
import { runAudit } from '../src/services/auditEngine.js';
import { validateCredentials, signToken, verifyToken } from '../src/services/auth.js';
import { isSafeNodeVersion } from '../src/nodeVersionGuard.js';
import { shopifyAdminProductUrl } from '../src/services/shopify.js';
import { config } from '../src/config.js';

describe('categoryRules', () => {
  it('clasifica categorías ML', () => {
    assert.equal(resolveCategoryKey('Autopartes Toyota'), 'autopartes');
    assert.equal(resolveCategoryKey('Audífonos Bluetooth'), 'accesorios_tecnologicos');
    assert.equal(resolveCategoryKey('Laptop gamer'), 'electronicos');
    assert.equal(resolveCategoryKey('Otro'), 'general');
  });

  it('limpia HTML y extrae hints básicos', () => {
    assert.equal(stripHtml('<p>Hola&nbsp;<b>mundo</b></p>'), 'Hola mundo');
    const hints = extractFieldHints('Modelo AB-9. Voltaje: 110V. Potencia: 20W. Conexión Bluetooth.');
    assert.match(String(hints.modelo), /^AB-9/);
    assert.equal(hints.voltaje, '110V');
    assert.equal(hints.potencia, '20W');
    assert.match(String(hints.tipo_conexion), /bluetooth/i);
  });
});

describe('auditEngine', () => {
  it('marca título largo, recomienda ≤60 y baja score si hay críticos', async () => {
    const result = await runAudit({
      title:
        'Cargador USB Cargador Rápido USB C Universal Cargador para Celular Tablet Laptop Extra Largo',
      description: '<p>lorem ipsum texto de ejemplo</p>',
      productCategory: 'accesorios tecnológicos',
      brand: '',
      model: '',
      sku: 'T-1',
      specifications: {},
      images: [],
      packageContents: ''
    });
    assert.ok(result.recommendedTitle.length <= 60);
    assert.ok(result.findings.some((f) => /título|titulo|60/i.test(f.title + f.description)));
    assert.ok(result.qualityScore < 80);
    assert.ok(
      ['requiere_correcciones_importantes', 'requiere_mejoras'].includes(result.auditStatus)
    );
  });

  it('pub completa razonable obtiene score alto', async () => {
    const result = await runAudit({
      title: 'Audífonos BT Pro X5 40mm',
      description:
        '<p>Audífonos Bluetooth Pro X5 de TechAudio. Conexión Bluetooth 5.2. Incluye: audífonos, cable USB-C, estuche. Compatible con iOS y Android.</p>',
      productCategory: 'accesorios tecnológicos',
      brand: 'TechAudio',
      model: 'Pro X5',
      sku: 'TA-PRO-X5',
      specifications: { tipo_conexion: 'Bluetooth 5.2', compatibilidad: 'iOS/Android' },
      images: ['https://cdn.example/a.jpg'],
      packageContents: 'Audífonos, cable USB-C, estuche'
    });
    assert.ok(result.qualityScore >= 70);
    assert.ok(result.recommendedTitle.length <= 60);
  });
});

describe('auth', () => {
  it('valida credenciales mínimas', () => {
    const bad = validateCredentials({ email: 'x', password: '123' }, { requireName: true });
    assert.ok(bad.errors.length >= 2);
    const ok = validateCredentials(
      { email: 'a@b.com', password: 'secreto12', name: 'Ana' },
      { requireName: true }
    );
    assert.deepEqual(ok.errors, []);
    assert.equal(ok.email, 'a@b.com');
  });

  it('firma y verifica JWT', () => {
    assert.ok(config.jwtSecret, 'JWT_SECRET requerido para la prueba');
    const token = signToken({ id: 'u1', roleSlug: 'user', email: 'a@b.com' });
    const payload = verifyToken(token);
    assert.equal(payload.sub, 'u1');
    assert.equal(payload.email, 'a@b.com');
  });
});

describe('nodeVersionGuard', () => {
  it('acepta parches oct 2026 y rechaza 24.14.1', () => {
    assert.equal(isSafeNodeVersion('v24.22.1'), true);
    assert.equal(isSafeNodeVersion('v24.22.2'), true);
    assert.equal(isSafeNodeVersion('v22.23.4'), true);
    assert.equal(isSafeNodeVersion('v24.14.1'), false);
    assert.equal(isSafeNodeVersion('v20.20.2'), false);
  });
});

describe('shopify url', () => {
  it('arma Admin URL solo si hay dominio en config', () => {
    const url = shopifyAdminProductUrl('12345');
    if (config.shopifyStoreDomain) {
      assert.match(url, /\/admin\/products\/12345$/);
    } else {
      assert.equal(url, null);
    }
  });
});
