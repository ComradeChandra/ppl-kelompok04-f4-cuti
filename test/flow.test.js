'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer, IDS } = require('./helpers');

const annual = (startDate, endDate) => ({ leaveType: 'ANNUAL', startDate, endDate, reason: 'Acara keluarga' });

test('alur utama: ajukan → validasi → COO setuju → CEO setuju → saldo berkurang → status terbaca F-5', async (t) => {
  const s = await startServer();
  t.after(s.close);

  const before = await s.call('GET', `/api/v1/leave-balances/${IDS.nadia}`, 'token-uji-karyawan');
  assert.equal(before.status, 200);
  assert.equal(before.body.remainingDays, 9);
  assert.equal(before.body.pendingDays, 3);
  assert.equal(before.body.availableDays, 6);

  const created = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', annual('2026-11-02', '2026-11-04'));
  assert.equal(created.status, 201);
  assert.equal(created.body.status, 'PENDING_COO');
  assert.equal(created.body.workingDays, 3);
  const id = created.body.leaveRequestId;
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);

  const queue = await s.call('GET', '/api/v1/leave-requests?scope=approval', 'token-uji-coo');
  assert.ok(queue.body.items.some((r) => r.leaveRequestId === id));

  const coo = await s.call('POST', `/api/v1/leave-requests/${id}/decisions`, 'token-uji-coo', { decision: 'APPROVE' });
  assert.equal(coo.status, 200);
  assert.equal(coo.body.status, 'PENDING_CEO');

  const ceo = await s.call('POST', `/api/v1/leave-requests/${id}/decisions`, 'token-uji-ceo', { decision: 'APPROVE' });
  assert.equal(ceo.status, 200);
  assert.equal(ceo.body.status, 'APPROVED');

  const after = await s.call('GET', `/api/v1/leave-balances/${IDS.nadia}`, 'token-uji-karyawan');
  assert.equal(after.body.remainingDays, 6);
  assert.equal(after.body.usedDays, 6);

  const detail = await s.call('GET', `/api/v1/leave-requests/${id}`, 'token-uji-karyawan');
  assert.deepEqual(detail.body.decisions.map((d) => d.stage), ['COO', 'CEO']);

  const status = await s.call('GET', `/api/v1/leave-status?employeeId=${IDS.nadia}&from=2026-11-01&to=2026-11-30`, 'token-uji-f5');
  assert.equal(status.status, 200);
  const item = status.body.items.find((r) => r.leaveRequestId === id);
  assert.equal(item.status, 'APPROVED');
  assert.equal(item.paid, true);
  assert.equal(item.workingDaysInRange, 3);

  const ledger = await s.call('GET', `/api/v1/leave-balances/${IDS.nadia}/ledger`, 'token-uji-karyawan');
  assert.equal(ledger.body.items[0].entryType, 'USAGE');
  assert.equal(ledger.body.items[0].changeDays, -3);

  const notif = await s.call('GET', '/api/v1/leave-notifications', 'token-uji-karyawan');
  assert.equal(notif.body.items[0].type, 'APPROVED');
});

test('ditolak: tanggal mulai kurang dari H-7 hari kerja (422 DEADLINE_H7), tidak ada data tersimpan', async (t) => {
  const s = await startServer();
  t.after(s.close);
  const res = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', annual('2026-10-26', '2026-10-27'));
  assert.equal(res.status, 422);
  assert.equal(res.body.code, 'DEADLINE_H7');
  const mine = await s.call('GET', '/api/v1/leave-requests', 'token-uji-karyawan');
  assert.equal(mine.body.items.length, 2);
});

test('ditolak: melebihi saldo dapat diajukan (422 INSUFFICIENT_BALANCE)', async (t) => {
  const s = await startServer();
  t.after(s.close);
  const res = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', annual('2026-11-02', '2026-11-10'));
  assert.equal(res.status, 422);
  assert.equal(res.body.code, 'INSUFFICIENT_BALANCE');
  assert.match(res.body.message, /6 hari, pengajuan 7 hari kerja/);
});

test('ditolak: masa kerja belum 12 bulan (422 NOT_ELIGIBLE) dan lintas tahun (422 CROSS_YEAR_NOT_ALLOWED)', async (t) => {
  const s = await startServer();
  t.after(s.close);
  const baru = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan-baru', annual('2026-11-02', '2026-11-03'));
  assert.equal(baru.body.code, 'NOT_ELIGIBLE');
  const lintas = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', annual('2026-12-30', '2027-01-04'));
  assert.equal(lintas.body.code, 'CROSS_YEAR_NOT_ALLOWED');
});

test('ditolak: tanggal bentrok dengan pengajuan aktif (409 DATE_OVERLAP)', async (t) => {
  const s = await startServer();
  t.after(s.close);
  const res = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', annual('2026-11-17', '2026-11-17'));
  assert.equal(res.status, 409);
  assert.equal(res.body.code, 'DATE_OVERLAP');
});

test('ditolak: tenaga ahli tidak dapat mengajukan (403)', async (t) => {
  const s = await startServer();
  t.after(s.close);
  const res = await s.call('POST', '/api/v1/leave-requests', 'token-uji-tenaga-ahli', annual('2026-11-02', '2026-11-03'));
  assert.equal(res.status, 403);
});

test('transisi status ditolak: COO memutus tahap CEO (409), karyawan menyetujui (403), tolak tanpa alasan (422)', async (t) => {
  const s = await startServer();
  t.after(s.close);
  const created = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', annual('2026-11-02', '2026-11-04'));
  const id = created.body.leaveRequestId;
  const byEmployee = await s.call('POST', `/api/v1/leave-requests/${id}/decisions`, 'token-uji-karyawan', { decision: 'APPROVE' });
  assert.equal(byEmployee.status, 403);
  const noReason = await s.call('POST', `/api/v1/leave-requests/${id}/decisions`, 'token-uji-coo', { decision: 'REJECT' });
  assert.equal(noReason.status, 422);
  assert.equal(noReason.body.code, 'REASON_REQUIRED');
  await s.call('POST', `/api/v1/leave-requests/${id}/decisions`, 'token-uji-coo', { decision: 'APPROVE' });
  const again = await s.call('POST', `/api/v1/leave-requests/${id}/decisions`, 'token-uji-coo', { decision: 'APPROVE' });
  assert.equal(again.status, 409);
  assert.equal(again.body.code, 'INVALID_STATE');
});

test('penolakan dengan alasan: status REJECTED dan saldo tidak berubah', async (t) => {
  const s = await startServer();
  t.after(s.close);
  const rej = await s.call('POST', `/api/v1/leave-requests/${IDS.nadiaPending}/decisions`, 'token-uji-coo', { decision: 'REJECT', reason: 'Bentrok dengan audit internal.' });
  assert.equal(rej.status, 200);
  assert.equal(rej.body.status, 'REJECTED');
  const bal = await s.call('GET', `/api/v1/leave-balances/${IDS.nadia}`, 'token-uji-karyawan');
  assert.equal(bal.body.remainingDays, 9);
  assert.equal(bal.body.pendingDays, 0);
});

test('pembatalan cuti APPROVED sebelum tanggal mulai mengembalikan saldo', async (t) => {
  const s = await startServer();
  t.after(s.close);
  const c = await s.call('POST', `/api/v1/leave-requests/${IDS.nadiaApproved}/cancel`, 'token-uji-karyawan');
  assert.equal(c.status, 200);
  assert.equal(c.body.status, 'CANCELLED');
  const bal = await s.call('GET', `/api/v1/leave-balances/${IDS.nadia}`, 'token-uji-karyawan');
  assert.equal(bal.body.remainingDays, 12);
});

test('gugur otomatis saat tanggal mulai tiba tanpa keputusan (EXPIRED)', async (t) => {
  const s = await startServer('2026-11-16');
  t.after(s.close);
  const d = await s.call('GET', `/api/v1/leave-requests/${IDS.nadiaPending}`, 'token-uji-karyawan');
  assert.equal(d.body.status, 'EXPIRED');
});

test('cuti haid langsung APPROVED dan dibatasi 2 hari per bulan', async (t) => {
  const s = await startServer();
  t.after(s.close);
  const ok = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan-sinta', { leaveType: 'MENSTRUAL', startDate: '2026-10-13', endDate: '2026-10-13', reason: 'Cuti haid' });
  assert.equal(ok.status, 201);
  assert.equal(ok.body.status, 'APPROVED');
  const third = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan-sinta', { leaveType: 'MENSTRUAL', startDate: '2026-10-14', endDate: '2026-10-14', reason: 'Cuti haid' });
  assert.equal(third.body.code, 'MENSTRUAL_LIMIT');
});

test('cuti sakit wajib lampiran; susulan lebih dari 3 hari kerja ditolak', async (t) => {
  const s = await startServer();
  t.after(s.close);
  const noAtt = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', { leaveType: 'SICK', startDate: '2026-10-19', endDate: '2026-10-19', reason: 'Demam' });
  assert.equal(noAtt.body.code, 'ATTACHMENT_REQUIRED');
  const late = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', { leaveType: 'SICK', startDate: '2026-10-08', endDate: '2026-10-09', reason: 'Demam', attachmentIds: ['0192f1e6-5a71-7c80-8d9e-1f2a3b4c5d6e'] });
  assert.equal(late.body.code, 'SICK_BACKDATE_LIMIT');
  const ok = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', { leaveType: 'SICK', startDate: '2026-10-15', endDate: '2026-10-16', reason: 'Demam', attachmentIds: ['0192f1e6-5a71-7c80-8d9e-1f2a3b4c5d6e'] });
  assert.equal(ok.status, 201);
  assert.equal(ok.body.status, 'PENDING_COO');
});

test('Idempotency-Key yang sama tidak membuat pengajuan ganda', async (t) => {
  const s = await startServer();
  t.after(s.close);
  const key = { 'Idempotency-Key': '3f1c9a2e-5b7d-4e8f-a1b2-c3d4e5f60718' };
  const a = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', annual('2026-11-02', '2026-11-03'), key);
  const b = await s.call('POST', '/api/v1/leave-requests', 'token-uji-karyawan', annual('2026-11-02', '2026-11-03'), key);
  assert.equal(a.body.leaveRequestId, b.body.leaveRequestId);
  const mine = await s.call('GET', '/api/v1/leave-requests', 'token-uji-karyawan');
  assert.equal(mine.body.items.length, 3);
});
