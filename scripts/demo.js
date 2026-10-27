'use strict';
// Demo alur utama F-4: ajukan → validasi → keputusan COO/CEO → status.
// Menjalankan layanan dari seed dengan tanggal demo 2026-10-19, lalu mencatat setiap request dan respons
// ke bukti/demo-log.txt sebagai bukti demo yang dapat diulang.
const fs = require('node:fs');
const path = require('node:path');
const { startServer } = require('../test/helpers');

const NADIA = 'EMP-001';
const lines = [];
const responses = [];
const log = (s = '') => { lines.push(s); console.log(s); };

async function step(s, no, title, method, url, token, body, expect) {
  const res = await s.call(method, url, token, body);
  const ok = res.status === expect;
  responses.push({ method, url, status: res.status, body: res.body });
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
  const s = await startServer('2026-10-19');
  log('DEMO ALUR LOKAL F-4 PENGAJUAN DAN PERSETUJUAN CUTI');
  log(`Tanggal demo (Asia/Jakarta): 2026-10-19 | Data: seed/seed.json | Kontrak: openapi/openapi.yaml v1.0.0`);
  log('Mock dependensi: F-1 (token uji), F-2 (data karyawan seed), F-3 (hari libur seed)');
  log('='.repeat(78));
  log('KASUS BERHASIL');
  log();
  await step(s, 1, 'Karyawan (Nadia) melihat saldo sebelum mengajukan', 'GET', `/api/v1/leave-balances/${NADIA}`, 'token-uji-karyawan', null, 200);
  const created = await step(s, 2, 'Karyawan mengajukan cuti tahunan 2-4 November 2026 (lolos validasi)', 'POST', '/api/v1/leave-requests', 'token-uji-karyawan',
    { leaveType: 'ANNUAL', startDate: '2026-11-02', endDate: '2026-11-04', reason: 'Menghadiri pernikahan saudara' }, 201);
  const id = created.body.leaveRequestId;
  await step(s, 3, 'COO melihat antrean persetujuan', 'GET', '/api/v1/leave-requests?scope=approval', 'token-uji-coo', null, 200);
  await step(s, 4, 'COO menyetujui (tahap 1)', 'POST', `/api/v1/leave-requests/${id}/decisions`, 'token-uji-coo', { decision: 'APPROVE' }, 200);
  await step(s, 5, 'CEO menyetujui (tahap akhir), saldo diperiksa ulang lalu dipotong', 'POST', `/api/v1/leave-requests/${id}/decisions`, 'token-uji-ceo', { decision: 'APPROVE' }, 200);
  await step(s, 6, 'Karyawan melihat saldo setelah disetujui (sisa 9 → 6)', 'GET', `/api/v1/leave-balances/${NADIA}`, 'token-uji-karyawan', null, 200);
  await step(s, 7, 'Karyawan melihat detail dan linimasa keputusan', 'GET', `/api/v1/leave-requests/${id}`, 'token-uji-karyawan', null, 200);
  await step(s, 8, 'F-5 (payroll) membaca status cuti November 2026', 'GET', `/api/v1/leave-status?employeeId=${NADIA}&from=2026-11-01&to=2026-11-30`, 'token-uji-f5', null, 200);
  log('='.repeat(78));
  log('KASUS GAGAL ATAU DITOLAK');
  log();
  await step(s, 9, 'Cuti tahunan mulai 26 Oktober (kurang dari H-7 hari kerja) ditolak', 'POST', '/api/v1/leave-requests', 'token-uji-karyawan',
    { leaveType: 'ANNUAL', startDate: '2026-10-26', endDate: '2026-10-27', reason: 'Keperluan keluarga' }, 422);
  await step(s, 10, 'Cuti tahunan 7 hari kerja melebihi saldo dapat diajukan ditolak', 'POST', '/api/v1/leave-requests', 'token-uji-karyawan',
    { leaveType: 'ANNUAL', startDate: '2026-12-01', endDate: '2026-12-09', reason: 'Liburan akhir tahun' }, 422);
  await step(s, 11, 'COO mencoba memutus ulang pengajuan yang sudah APPROVED ditolak', 'POST', `/api/v1/leave-requests/${id}/decisions`, 'token-uji-coo', { decision: 'APPROVE' }, 409);
  await step(s, 12, 'Karyawan mencoba menyetujui pengajuan ditolak', 'POST', `/api/v1/leave-requests/${id}/decisions`, 'token-uji-karyawan', { decision: 'APPROVE' }, 403);
  await step(s, 13, 'Data tetap konsisten: daftar pengajuan karyawan tidak bertambah oleh request yang ditolak', 'GET', '/api/v1/leave-requests', 'token-uji-karyawan', null, 200);
  await s.close();
  const out = path.join(__dirname, '..', 'bukti', 'demo-log.txt');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${lines.join('\n')}\n`);
  fs.writeFileSync(path.join(path.dirname(out), 'demo-responses.json'), `${JSON.stringify(responses, null, 2)}\n`);
  console.log(`Log demo disimpan di ${path.relative(process.cwd(), out)}`);
})();
