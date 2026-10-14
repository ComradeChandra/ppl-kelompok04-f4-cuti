'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const { createApp } = require('../src/app');

const SEED = path.join(__dirname, '..', 'seed', 'seed.json');
const NADIA = '0192f1a2-7c3e-7a10-9b2d-4e5f6a7b8c9d';
let server;
let base;

test.before(async () => {
  server = http.createServer(createApp(SEED));
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());

const get = (p, token = 'token-uji-f5') =>
  fetch(base + p, { headers: token ? { Authorization: `Bearer ${token}` } : {} });

test('GET /health berjalan', async () => {
  const res = await get('/health', null);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).status, 'ok');
});

test('200: hanya cuti APPROVED pada rentang yang dikirim', async () => {
  const res = await get(`/api/v1/leave-status?employeeId=${NADIA}&from=2026-10-01&to=2026-10-31`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.employeeId, NADIA);
  assert.equal(body.items.length, 1);
  assert.deepEqual(Object.keys(body.items[0]).sort(),
    ['approvedAt', 'endDate', 'leaveRequestId', 'leaveType', 'paid', 'startDate', 'status', 'workingDays']);
  assert.equal(body.items[0].status, 'APPROVED');
  assert.equal(body.items[0].paid, true);
});

test('200 dengan items kosong bila tidak ada cuti APPROVED (PENDING tidak dikirim)', async () => {
  const res = await get(`/api/v1/leave-status?employeeId=${NADIA}&from=2026-11-01&to=2026-11-30`);
  assert.equal(res.status, 200);
  assert.deepEqual((await res.json()).items, []);
});

test('400 bila to sebelum from', async () => {
  const res = await get(`/api/v1/leave-status?employeeId=${NADIA}&from=2026-10-31&to=2026-10-01`);
  assert.equal(res.status, 400);
  assert.equal((await res.json()).code, 'INVALID_DATE_RANGE');
});

test('400 bila format tanggal salah', async () => {
  const res = await get(`/api/v1/leave-status?employeeId=${NADIA}&from=01-10-2026&to=2026-10-31`);
  assert.equal(res.status, 400);
  assert.equal((await res.json()).code, 'VALIDATION_ERROR');
});

test('401 tanpa token', async () => {
  const res = await get(`/api/v1/leave-status?employeeId=${NADIA}&from=2026-10-01&to=2026-10-31`, null);
  assert.equal(res.status, 401);
  assert.equal((await res.json()).code, 'UNAUTHORIZED');
});

test('403 bila pemanggil bukan layanan F-3/F-5', async () => {
  const res = await get(`/api/v1/leave-status?employeeId=${NADIA}&from=2026-10-01&to=2026-10-31`, 'token-uji-karyawan');
  assert.equal(res.status, 403);
  assert.equal((await res.json()).code, 'FORBIDDEN');
});

test('404 bila employeeId tidak dikenal', async () => {
  const res = await get('/api/v1/leave-status?employeeId=0192f1ff-0000-7000-8000-000000000000&from=2026-10-01&to=2026-10-31');
  assert.equal(res.status, 404);
  assert.equal((await res.json()).code, 'EMPLOYEE_NOT_FOUND');
});
