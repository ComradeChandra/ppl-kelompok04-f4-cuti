'use strict';
// Adapter referensi karyawan Kelompok 2 (API-K02-17). Uji ini memakai server tiruan yang meniru respons F-2
// (status dan bentuk JSON dari src/controllers/sdm.controller.ts repo derrwnd/PPL-F-2 commit ad0b959) agar CI tidak
// bergantung pada layanan F-2. Uji terhadap layanan F-2 yang sebenarnya dijalankan dengan scripts/integrasi-f2.js.
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { startServer } = require('./helpers');

const SANDY = '01929b4a-5f10-7a22-9d44-3c8f1b2e7a90';
const RINA = '01a1598a-6356-7933-8239-589944b35d30';
const REF = {
  [SANDY]: { employeeId: SANDY, nomorPegawai: 'SDM-2026-001', namaLengkap: 'Sandy Walsh', jabatanId: '01929b4a-83a1-7d55-8b12-9f7c2e4a6b10', namaJabatan: 'Project Manager', statusKerja: 'karyawan' },
  [RINA]: { employeeId: RINA, nomorPegawai: 'SDM-2026-002', namaLengkap: 'Rina Maharani', jabatanId: '01929b4a-83a1-7d55-8b12-9f7c2e4a6b10', namaJabatan: 'Junior Programmer', statusKerja: 'kontrak' },
};

async function fakeF2() {
  const calls = [];
  const srv = http.createServer((req, res) => {
    calls.push(`${req.method} ${req.url}`);
    const send = (code, body) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
    if (req.headers.authorization !== 'Bearer token-coo') return send(401, { code: 401, message: 'Token tidak valid.' });
    const m = req.url.match(/^\/api\/v1\/referensi\/sdm\/([^/]+)$/);
    if (!m) return send(404, { message: 'Not Found' });
    const ref = REF[decodeURIComponent(m[1])];
    return ref ? send(200, ref) : send(404, { code: 404, message: 'EMPLOYEE_NOT_FOUND' });
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  return { url: `http://127.0.0.1:${srv.address().port}`, calls, close: () => new Promise((r) => srv.close(r)) };
}

const draft = { leaveType: 'ANNUAL', startDate: '2026-11-23', endDate: '2026-11-24', reason: 'Urusan keluarga', submit: false };

test('mode f2: draf dibuat untuk karyawan yang dikenal API Kelompok 2, nama pemohon dari F-2', async (t) => {
  const f2 = await fakeF2();
  const s = await startServer('2026-11-03', { employees: { source: 'f2', baseUrl: f2.url, token: 'token-coo' } });
  t.after(async () => { await s.close(); await f2.close(); });
  const created = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan-f2', draft);
  assert.equal(created.status, 201);
  assert.equal(created.body.employeeId, SANDY);
  assert.equal(created.body.status, 'DRAFT');
  const detail = await s.call('GET', `/api/v1/leave-requests/${created.body.leaveRequestId}`, 'token-uji-karyawan-f2');
  assert.equal(detail.body.employeeName, 'Sandy Walsh');
  assert.ok(f2.calls.includes(`GET /api/v1/referensi/sdm/${SANDY}`));
});

test('mode f2: employeeId yang tidak dikenal F-2 ditolak 404 dan tidak tersimpan', async (t) => {
  const f2 = await fakeF2();
  const s = await startServer('2026-11-03', { employees: { source: 'f2', baseUrl: f2.url, token: 'token-coo' } });
  t.after(async () => { await s.close(); await f2.close(); });
  const res = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', draft);
  assert.equal(res.status, 404);
  assert.equal(res.body.code, 'EMPLOYEE_NOT_FOUND');
  const mine = await s.call('GET', '/api/v1/leave-requests?year=2026', 'token-uji-karyawan');
  assert.ok(!mine.body.items.some((r) => r.startDate === '2026-11-23'));
});

test('mode f2: status kerja kontrak belum diatur sehingga ditolak 403', async (t) => {
  const f2 = await fakeF2();
  const s = await startServer('2026-11-03', { employees: { source: 'f2', baseUrl: f2.url, token: 'token-coo' } });
  t.after(async () => { await s.close(); await f2.close(); });
  const res = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan-f2-kontrak', draft);
  assert.equal(res.status, 403);
  assert.match(res.body.message, /kontrak/);
});

test('mode f2: layanan F-2 tidak terjangkau → 503 REFERENCE_UNAVAILABLE, tidak ada data tersimpan', async (t) => {
  const s = await startServer('2026-11-03', { employees: { source: 'f2', baseUrl: 'http://127.0.0.1:9', token: 'token-coo', timeoutMs: 1000 } });
  t.after(s.close);
  const res = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan-f2', draft);
  assert.equal(res.status, 503);
  assert.equal(res.body.code, 'REFERENCE_UNAVAILABLE');
});

test('mode f2: token layanan F-4 ditolak F-2 → 503 dengan pesan akses ditolak', async (t) => {
  const f2 = await fakeF2();
  const s = await startServer('2026-11-03', { employees: { source: 'f2', baseUrl: f2.url, token: 'token-salah' } });
  t.after(async () => { await s.close(); await f2.close(); });
  const res = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan-f2', draft);
  assert.equal(res.status, 503);
  assert.match(res.body.message, /menolak akses/);
});
