'use strict';
// Pertemuan 5: operasi buat, lihat, dan ubah draf pengajuan cuti beserta validasi VAL-01 sampai VAL-05.
const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer, IDS } = require('./helpers');

const DEMO = '2026-10-27';
const draft = (over = {}) => ({ leaveType: 'ANNUAL', startDate: '2026-11-09', endDate: '2026-11-11', reason: 'Menghadiri pernikahan saudara', submit: false, ...over });

test('buat → lihat → ubah → lihat ulang draf dengan leaveRequestId yang sama', async (t) => {
  const s = await startServer(DEMO);
  t.after(s.close);
  const b01 = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', draft());
  assert.equal(b01.status, 201);
  assert.equal(b01.body.status, 'DRAFT');
  assert.equal(b01.body.employeeId, 'EMP-001');
  assert.equal(b01.body.workingDays, 3);
  const id = b01.body.leaveRequestId;
  const b02 = await s.call('GET', `/api/v1/leave-requests/${id}`, 'token-uji-karyawan');
  assert.equal(b02.body.status, 'DRAFT');
  const b03 = await s.call('PATCH', `/api/v1/leave-requests/${id}`, 'token-uji-karyawan', { endDate: '2026-11-12', reason: 'Menghadiri pernikahan saudara di luar kota' });
  assert.equal(b03.status, 200);
  assert.equal(b03.body.leaveRequestId, id);
  assert.equal(b03.body.workingDays, 4);
  assert.equal(b03.body.status, 'DRAFT');
  assert.notEqual(b03.body.updatedAt, b02.body.updatedAt);
  const b04 = await s.call('GET', `/api/v1/leave-requests/${id}`, 'token-uji-karyawan');
  assert.equal(b04.body.endDate, '2026-11-12');
  assert.equal(b04.body.reason, 'Menghadiri pernikahan saudara di luar kota');
  const bal = await s.call('GET', '/api/v1/leave-balances/EMP-001', 'token-uji-karyawan');
  assert.equal(bal.body.availableDays, 6, 'draf tidak mengurangi saldo dapat diajukan');
  const queue = await s.call('GET', '/api/v1/leave-requests?scope=approval', 'token-uji-coo');
  assert.ok(!queue.body.items.some((r) => r.leaveRequestId === id), 'draf tidak tampil di antrean COO');
});

test('VAL-01: draf kedua dengan tanggal bertumpuk ditolak 409 dan tidak tersimpan', async (t) => {
  const s = await startServer(DEMO);
  t.after(s.close);
  await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', draft());
  const dup = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', draft());
  assert.equal(dup.status, 409);
  assert.equal(dup.body.code, 'DATE_OVERLAP');
  const mine = await s.call('GET', '/api/v1/leave-requests', 'token-uji-karyawan');
  assert.equal(mine.body.items.filter((r) => r.startDate === '2026-11-09').length, 1);
});

test('VAL-02: ubah draf dengan tanggal akhir sebelum tanggal mulai ditolak 400 tanpa perubahan sebagian', async (t) => {
  const s = await startServer(DEMO);
  t.after(s.close);
  const id = (await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', draft())).body.leaveRequestId;
  const before = await s.call('GET', `/api/v1/leave-requests/${id}`, 'token-uji-karyawan');
  const bad = await s.call('PATCH', `/api/v1/leave-requests/${id}`, 'token-uji-karyawan', { endDate: '2026-11-06', reason: 'Alasan baru' });
  assert.equal(bad.status, 400);
  assert.equal(bad.body.code, 'VALIDATION_ERROR');
  const after = await s.call('GET', `/api/v1/leave-requests/${id}`, 'token-uji-karyawan');
  assert.deepEqual(after.body, before.body);
});

test('VAL-03: karyawan yang tidak ada di referensi karyawan ditolak 404 dan tidak tersimpan', async (t) => {
  const s = await startServer(DEMO);
  t.after(s.close);
  const res = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan-3', draft());
  assert.equal(res.status, 404);
  assert.equal(res.body.code, 'EMPLOYEE_NOT_FOUND');
});

test('VAL-04: hanya pemilik yang boleh mengubah, dan hanya selama DRAFT', async (t) => {
  const s = await startServer(DEMO);
  t.after(s.close);
  const id = (await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', draft())).body.leaveRequestId;
  const own = await s.call('PATCH', `/api/v1/leave-requests/${id}`, 'token-uji-karyawan', { reason: 'Alasan diperbarui' });
  assert.equal(own.status, 200);
  for (const token of ['token-uji-karyawan-2', 'token-uji-coo']) {
    const r = await s.call('PATCH', `/api/v1/leave-requests/${id}`, token, { reason: 'Diubah orang lain' });
    assert.equal(r.status, 403, token);
  }
  const sent = await s.call('PATCH', `/api/v1/leave-requests/${IDS.nadiaPending}`, 'token-uji-karyawan', { reason: 'Ubah setelah dikirim' });
  assert.equal(sent.status, 409);
  assert.equal(sent.body.code, 'INVALID_STATE');
});

test('VAL-05: draf cuti tahunan kurang dari H-7 hari kerja ditolak 422', async (t) => {
  const s = await startServer(DEMO);
  t.after(s.close);
  const ok = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', draft({ startDate: '2026-11-23', endDate: '2026-11-24' }));
  assert.equal(ok.status, 201);
  const bad = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', draft({ startDate: '2026-11-02', endDate: '2026-11-03' }));
  assert.equal(bad.status, 422);
  assert.equal(bad.body.code, 'DEADLINE_H7');
});

test('draf dikirim → PENDING_COO dan masuk antrean COO; draf tidak bisa dikirim dua kali', async (t) => {
  const s = await startServer(DEMO);
  t.after(s.close);
  const id = (await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', draft())).body.leaveRequestId;
  const sub = await s.call('POST', `/api/v1/leave-requests/${id}/submit`, 'token-uji-karyawan');
  assert.equal(sub.status, 200);
  assert.equal(sub.body.status, 'PENDING_COO');
  const queue = await s.call('GET', '/api/v1/leave-requests?scope=approval', 'token-uji-coo');
  assert.ok(queue.body.items.some((r) => r.leaveRequestId === id));
  const again = await s.call('POST', `/api/v1/leave-requests/${id}/submit`, 'token-uji-karyawan');
  assert.equal(again.status, 409);
});
