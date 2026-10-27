'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer, IDS } = require('./helpers');

const q = (employeeId, from, to) => `/api/v1/leave-status?employeeId=${employeeId}&from=${from}&to=${to}`;
let s;
test.before(async () => { s = await startServer(); });
test.after(() => s.close());

test('GET /health berjalan', async () => {
  const res = await s.call('GET', '/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('200: hanya cuti APPROVED pada rentang, dengan field sesuai kontrak', async () => {
  const res = await s.call('GET', q(IDS.nadia, '2026-10-01', '2026-10-31'), 'token-uji-f5');
  assert.equal(res.status, 200);
  assert.equal(res.body.items.length, 1);
  assert.deepEqual(Object.keys(res.body.items[0]).sort(),
    ['approvedAt', 'endDate', 'leaveRequestId', 'leaveType', 'paid', 'startDate', 'status', 'workingDays', 'workingDaysInRange']);
});

test('workingDaysInRange hanya menghitung hari kerja di dalam rentang (masukan review F-5)', async () => {
  const res = await s.call('GET', q(IDS.nadia, '2026-10-21', '2026-10-31'), 'token-uji-f3');
  assert.equal(res.body.items[0].workingDays, 3);
  assert.equal(res.body.items[0].workingDaysInRange, 2);
});

test('200 dengan items kosong bila hanya ada cuti PENDING', async () => {
  const res = await s.call('GET', q(IDS.nadia, '2026-11-01', '2026-11-30'), 'token-uji-f5');
  assert.deepEqual(res.body.items, []);
});

test('400: parameter kosong, format employeeId salah, tanggal salah, to < from, rentang > 31 hari', async () => {
  const cases = [
    ['/api/v1/leave-status?from=2026-10-01&to=2026-10-31', 'VALIDATION_ERROR'],
    [q('EMP_001', '2026-10-01', '2026-10-31'), 'INVALID_EMPLOYEE_ID'],
    [q(IDS.nadia, '01-10-2026', '2026-10-31'), 'VALIDATION_ERROR'],
    [q(IDS.nadia, '2026-10-31', '2026-10-01'), 'INVALID_DATE_RANGE'],
    [q(IDS.nadia, '2026-10-01', '2026-11-01'), 'RANGE_TOO_LONG'],
  ];
  for (const [path, code] of cases) {
    const res = await s.call('GET', path, 'token-uji-f5');
    assert.equal(res.status, 400, path);
    assert.equal(res.body.code, code, path);
  }
  const ok31 = await s.call('GET', q(IDS.nadia, '2026-10-01', '2026-10-31'), 'token-uji-f5');
  assert.equal(ok31.status, 200);
});

test('401 tanpa token, 403 bukan layanan F-3/F-5, 404 employeeId tidak dikenal', async () => {
  assert.equal((await s.call('GET', q(IDS.nadia, '2026-10-01', '2026-10-31'))).status, 401);
  assert.equal((await s.call('GET', q(IDS.nadia, '2026-10-01', '2026-10-31'), 'token-uji-karyawan')).status, 403);
  const nf = await s.call('GET', q('EMP-999', '2026-10-01', '2026-10-31'), 'token-uji-f5');
  assert.equal(nf.status, 404);
  assert.equal(nf.body.code, 'EMPLOYEE_NOT_FOUND');
});
