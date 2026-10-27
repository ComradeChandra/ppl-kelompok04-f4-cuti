'use strict';
// Uji pertemuan 5: buat, lihat, ubah draf pengajuan cuti dan validasi VAL-01 sampai VAL-05 (B-01 sampai B-13).
// Layanan dijalankan dari seed dengan tanggal demo 2026-10-27; setiap request dan respons dicatat ke bukti/p5-log.txt.
const fs = require('node:fs');
const path = require('node:path');
const { startServer } = require('../test/helpers');

const PENDING_SEED = '0192f1b2-3c4d-7e5f-9a6b-7c8d9e0f1a2b';
const lines = [];
const responses = [];
const log = (s = '') => { lines.push(s); console.log(s); };

async function step(s, no, title, method, url, token, body, expect) {
  const res = await s.call(method, url, token, body);
  const ok = res.status === expect;
  responses.push({ no, method, url, status: res.status, body: res.body });
  log(`[${no}] ${title}`);
  log(`    ${method} ${url}  (token: ${token || '-'})`);
  if (body) log(`    body: ${JSON.stringify(body)}`);
  log(`    → HTTP ${res.status} ${ok ? '(sesuai harapan)' : `(DIHARAPKAN ${expect})`}`);
  log(`    ${JSON.stringify(res.body, null, 2).split('\n').join('\n    ')}`);
  log();
  if (!ok) process.exitCode = 1;
  return res;
}

(async () => {
  const s = await startServer('2026-10-27');
  const draft = { leaveType: 'ANNUAL', startDate: '2026-11-09', endDate: '2026-11-11', reason: 'Menghadiri pernikahan saudara', submit: false };
  log('UJI PERTEMUAN 5 F-4: OPERASI BUAT, LIHAT, UBAH DRAF DAN VALIDASI DASAR');
  log('Tanggal demo (Asia/Jakarta): 2026-10-27 | Data: seed/seed.json | Kontrak: openapi/openapi.yaml v1.1.0');
  log('Mock dependensi: Kelompok 1 (token uji), Kelompok 2 (referensi karyawan EMP-001), Kelompok 3 (hari libur)');
  log('='.repeat(78));
  log('OPERASI BUAT, LIHAT, UBAH (objek yang sama)');
  log();
  const b01 = await step(s, 'B-01', 'Buat draf cuti tahunan 9-11 November 2026 (EMP-001)', 'POST', '/api/v1/leave-requests', 'token-uji-karyawan', draft, 201);
  const id = b01.body.leaveRequestId;
  await step(s, 'B-02', 'Lihat draf dengan leaveRequestId dari B-01', 'GET', `/api/v1/leave-requests/${id}`, 'token-uji-karyawan', null, 200);
  await step(s, 'B-03', 'Ubah draf: tanggal akhir 12 November dan alasan baru', 'PATCH', `/api/v1/leave-requests/${id}`, 'token-uji-karyawan',
    { endDate: '2026-11-12', reason: 'Menghadiri pernikahan saudara di luar kota' }, 200);
  await step(s, 'B-04', 'Lihat ulang draf dengan request baru', 'GET', `/api/v1/leave-requests/${id}`, 'token-uji-karyawan', null, 200);
  log('='.repeat(78));
  log('VALIDASI DASAR');
  log();
  await step(s, 'B-05', 'VAL-01 ditolak: draf kedua dengan tanggal yang sama', 'POST', '/api/v1/leave-requests', 'token-uji-karyawan', draft, 409);
  await step(s, 'B-05a', 'VAL-01 kondisi data: daftar pengajuan EMP-001 setelah penolakan', 'GET', '/api/v1/leave-requests?scope=mine', 'token-uji-karyawan', null, 200);
  await step(s, 'B-06', 'VAL-02 ditolak: ubah draf dengan tanggal akhir 6 November (sebelum tanggal mulai)', 'PATCH', `/api/v1/leave-requests/${id}`, 'token-uji-karyawan', { endDate: '2026-11-06' }, 400);
  await step(s, 'B-06a', 'VAL-02 kondisi data: draf setelah penolakan', 'GET', `/api/v1/leave-requests/${id}`, 'token-uji-karyawan', null, 200);
  await step(s, 'B-07', 'VAL-03 ditolak: token karyawan EMP-999 (tidak ada di referensi karyawan) membuat draf', 'POST', '/api/v1/leave-requests', 'token-uji-karyawan-3', draft, 404);
  await step(s, 'B-07a', 'VAL-03 kondisi data: daftar pengajuan EMP-001 tidak berubah', 'GET', '/api/v1/leave-requests?scope=mine', 'token-uji-karyawan', null, 200);
  await step(s, 'B-08', 'VAL-04 valid: pemilik mengubah alasan draf', 'PATCH', `/api/v1/leave-requests/${id}`, 'token-uji-karyawan', { reason: 'Menghadiri pernikahan saudara di Surabaya' }, 200);
  await step(s, 'B-09', 'VAL-04 ditolak: karyawan lain (EMP-003) mengubah draf EMP-001', 'PATCH', `/api/v1/leave-requests/${id}`, 'token-uji-karyawan-2', { reason: 'Diubah orang lain' }, 403);
  await step(s, 'B-09b', 'VAL-04 ditolak: COO mengubah draf EMP-001', 'PATCH', `/api/v1/leave-requests/${id}`, 'token-uji-coo', { reason: 'Diubah COO' }, 403);
  await step(s, 'B-10', 'VAL-04 ditolak: pemilik mengubah pengajuan yang sudah PENDING_COO', 'PATCH', `/api/v1/leave-requests/${PENDING_SEED}`, 'token-uji-karyawan', { reason: 'Ubah setelah dikirim' }, 409);
  await step(s, 'B-10a', 'VAL-04 kondisi data: draf tetap berisi perubahan pemilik (B-08)', 'GET', `/api/v1/leave-requests/${id}`, 'token-uji-karyawan', null, 200);
  await step(s, 'B-10b', 'VAL-04 kondisi data: pengajuan PENDING_COO tidak berubah', 'GET', `/api/v1/leave-requests/${PENDING_SEED}`, 'token-uji-karyawan', null, 200);
  await step(s, 'B-11', 'VAL-05 valid: draf cuti tahunan 23-24 November (lebih dari H-7 hari kerja)', 'POST', '/api/v1/leave-requests', 'token-uji-karyawan',
    { ...draft, startDate: '2026-11-23', endDate: '2026-11-24', reason: 'Urusan keluarga' }, 201);
  await step(s, 'B-12', 'VAL-05 ditolak: draf cuti tahunan mulai 2 November (kurang dari H-7 hari kerja)', 'POST', '/api/v1/leave-requests', 'token-uji-karyawan',
    { ...draft, startDate: '2026-11-02', endDate: '2026-11-03', reason: 'Urusan keluarga' }, 422);
  await step(s, 'B-12a', 'VAL-05 kondisi data: daftar pengajuan EMP-001', 'GET', '/api/v1/leave-requests?scope=mine', 'token-uji-karyawan', null, 200);
  await step(s, 'B-12b', 'VAL-05 kondisi data: saldo EMP-001 tidak berubah oleh draf maupun penolakan', 'GET', '/api/v1/leave-balances/EMP-001', 'token-uji-karyawan', null, 200);
  await step(s, 'B-13', 'Mock Kelompok 1: request tanpa token ditolak', 'GET', `/api/v1/leave-requests/${id}`, null, null, 401);
  await s.close();
  const dir = path.join(__dirname, '..', 'bukti');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'p5-log.txt'), `${lines.join('\n')}\n`);
  fs.writeFileSync(path.join(dir, 'p5-responses.json'), `${JSON.stringify(responses, null, 2)}\n`);
  console.log('Log uji disimpan di bukti/p5-log.txt');
})();
