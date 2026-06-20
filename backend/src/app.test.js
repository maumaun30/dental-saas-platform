import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tmpDb = path.join(os.tmpdir(), `dental-test-${Date.now()}.json`);
process.env.DB_FILE = tmpDb;
process.env.JWT_SECRET = 'test-secret';
process.env.SEED_DEMO_USER = 'false';

const { createApp } = await import('./app.js');
const { initDb } = await import('./db.js');

let server;
let baseUrl;

before(async () => {
  await initDb();
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });
});

after(() => {
  server?.close();
  try { fs.unlinkSync(tmpDb); } catch { void 0; }
});

async function api(method, pathname, { token, body } = {}) {
  const res = await fetch(baseUrl + pathname, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

test('health check responds', async () => {
  const res = await api('GET', '/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('register -> login -> me flow', async () => {
  const reg = await api('POST', '/api/auth/register', {
    body: { email: 'a@b.com', password: 'secret1', name: 'A', practiceName: 'P' },
  });
  assert.equal(reg.status, 201);
  assert.ok(reg.body.token);

  const login = await api('POST', '/api/auth/login', {
    body: { email: 'a@b.com', password: 'secret1' },
  });
  assert.equal(login.status, 200);

  const me = await api('GET', '/api/auth/me', { token: login.body.token });
  assert.equal(me.status, 200);
  assert.equal(me.body.user.email, 'a@b.com');
});

test('rejects bad login', async () => {
  const res = await api('POST', '/api/auth/login', { body: { email: 'a@b.com', password: 'wrong' } });
  assert.equal(res.status, 401);
});

test('protected routes require a token', async () => {
  const res = await api('GET', '/api/viewer-state');
  assert.equal(res.status, 401);
});

test('viewer state persists per user', async () => {
  const login = await api('POST', '/api/auth/login', { body: { email: 'a@b.com', password: 'secret1' } });
  const token = login.body.token;

  const def = await api('GET', '/api/viewer-state', { token });
  assert.equal(def.body.state.numberingSystem, 'FDI');

  const put = await api('PUT', '/api/viewer-state', {
    token,
    body: { numberingSystem: 'Universal', selectedTooth: 14, theme: 'dental' },
  });
  assert.equal(put.body.state.numberingSystem, 'Universal');
  assert.equal(put.body.state.selectedTooth, 14);

  const after = await api('GET', '/api/viewer-state', { token });
  assert.equal(after.body.state.selectedTooth, 14);
});

test('measurements CRUD + bulk replace', async () => {
  const login = await api('POST', '/api/auth/login', { body: { email: 'a@b.com', password: 'secret1' } });
  const token = login.body.token;

  const created = await api('POST', '/api/measurements', {
    token,
    body: { studyUID: 'S1', presetId: 'pa-length', label: 'PA length', value: 12.3, unit: 'mm', tooth: 11 },
  });
  assert.equal(created.status, 201);
  const id = created.body.measurement.id;

  const list = await api('GET', '/api/measurements?studyUID=S1', { token });
  assert.equal(list.body.measurements.length, 1);

  const del = await api('DELETE', `/api/measurements/${id}`, { token });
  assert.equal(del.status, 204);

  const bulk = await api('PUT', '/api/measurements', {
    token,
    body: {
      studyUID: 'S1',
      measurements: [
        { label: 'Canal angle', value: 35, unit: '°', presetId: 'canal-angle' },
        { label: 'Crown width', value: 8.1, unit: 'mm', presetId: 'crown-width' },
      ],
    },
  });
  assert.equal(bulk.body.measurements.length, 2);

  const finalList = await api('GET', '/api/measurements?studyUID=S1', { token });
  assert.equal(finalList.body.measurements.length, 2);
});
