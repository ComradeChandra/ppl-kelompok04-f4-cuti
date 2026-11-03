'use strict';
// Uji integrasi pertemuan 6: layanan F-4 memanggil API referensi karyawan Kelompok 2 yang sedang berjalan
// (API-K02-17 GET /api/v1/referensi/sdm/{employeeId}). Jalankan layanan F-2 lebih dulu (repo derrwnd/PPL-F-2,
// npx tsx src/app.ts, port 8080), lalu: npm run integrasi:f2
// Variabel: F2_BASE_URL (bawaan http://localhost:8080), F2_TOKEN (bawaan token-coo).
// Hasil: bukti/p6-integrasi-f2-log.txt dan bukti/p6-integrasi-f2-responses.json.
const fs = require('node:fs');
const path = require('node:path');
const { startServer } = require('../test/helpers');

const F2 = (process.env.F2_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');
const F2_TOKEN = process.env.F2_TOKEN || 'token-coo';
const DEMO = '2026-11-03';
const { version } = require('../package.json');
const SANDY = '01929b4a-5f10-7a22-9d44-3c8f1b2e7a90';
const lines = [];
const responses = [];
const calls = [];
const log = (s = '') => { lines.push(s); console.log(s); };

async function step(s, no, title, method, url, token, body, expect) {
  const before = calls.length;
  const res = await s.call(method, url, token, body);
  const ok = res.status === expect;
  responses.push({ no, at: new Date().toISOString(), method, url, status: res.status, body: res.body });
  log(`[${no}] ${title}`);
  log(`    ${method} ${url}  (token F-4: ${token || '-'})  waktu: ${responses.at(-1).at}`);
  if (body) log(`    body: ${JSON.stringify(body)}`);
  log(`    → HTTP ${res.status} ${ok ? '(sesuai harapan)' : `(DIHARAPKAN ${expect})`}`);
  log(`    ${JSON.stringify(res.body, null, 2).split('\n').join('\n    ')}`);
  const made = calls.slice(before);
  log(made.length ? `    Panggilan F-4 ke F-2: ${made.map((c) => `${c.at} GET ${c.url.replace(F2, '')} -> ${c.status}${c.note ? ` (${c.note})` : ''}`).join('; ')}` : '    Panggilan F-4 ke F-2: tidak ada');
  log();
  if (!ok) process.exitCode = 1;
  return res;
}

(async () => {
  try {
    const probe = await fetch(`${F2}/`, { signal: AbortSignal.timeout(3000) });
    await probe.text();
  } catch {
    console.error(`Layanan F-2 tidak terjangkau di ${F2}. Jalankan dulu repo derrwnd/PPL-F-2 (npx tsx src/app.ts).`);
    process.exit(1);
  }
  const live = { source: 'f2', baseUrl: F2, token: F2_TOKEN, onCall: (c) => calls.push(c) };
  const s = await startServer(DEMO, { employees: live });
  const draft = { leaveType: 'ANNUAL', startDate: '2026-11-23', endDate: '2026-11-24', reason: 'Urusan keluarga', submit: false };

  log('UJI INTEGRASI PERTEMUAN 6: LAYANAN F-4 (KONSUMEN) → API REFERENSI KARYAWAN KELOMPOK 2 (PRODUSEN)');
  log(`Produsen: ${F2} API-K02-17 GET /api/v1/referensi/sdm/{employeeId} (OpenAPI F-2 1.1.0, repo derrwnd/PPL-F-2)`);
  log(`Konsumen: layanan F-4 kontrak ${version}, EMPLOYEE_SOURCE=f2, token layanan ke F-2: Bearer *** | Tanggal demo: ${DEMO}`);
  log(`Dijalankan: ${new Date().toISOString()} | Node ${process.version}`);
  log('Data uji F-2: Sandy Walsh 01929b4a-5f10-7a22-9d44-3c8f1b2e7a90 (karyawan), Rina Maharani 01a1598a-6356-7933-8239-589944b35d30 (kontrak)');
  log('Masih mock: token pengguna F-4 (Kelompok 1), kalender hari libur (Kelompok 3), tanggal masuk kerja (INT-02, seed employeeSupplements)');
  log('='.repeat(78));
  log('ALUR BERHASIL: karyawan Kelompok 2 membuat dan mengirim draf cuti tahunan');
  log();
  await step(s, 'I-01', 'Layanan F-4 berjalan dengan sumber referensi API Kelompok 2', 'GET', '/health', null, null, 200);
  await step(s, 'I-02', 'Sandy Walsh membuka saldo; F-4 memeriksa employeeId ke API F-2', 'GET', `/api/v1/leave-balances/${SANDY}`, 'token-uji-karyawan-f2', null, 200);
  const created = await step(s, 'I-03', 'Sandy Walsh membuat draf cuti tahunan 23-24 November 2026', 'POST', '/api/v1/leave-requests', 'token-uji-karyawan-f2', draft, 201);
  const id = created.body.leaveRequestId;
  await step(s, 'I-04', 'Detail draf memuat nama pemohon dari API F-2', 'GET', `/api/v1/leave-requests/${id}`, 'token-uji-karyawan-f2', null, 200);
  await step(s, 'I-05', 'Sandy Walsh mengirim draf (pemeriksaan ulang ke API F-2)', 'POST', `/api/v1/leave-requests/${id}/submit`, 'token-uji-karyawan-f2', null, 200);
  await step(s, 'I-06', 'COO melihat antrean; nama pemohon berasal dari API F-2', 'GET', '/api/v1/leave-requests?scope=approval', 'token-uji-coo', null, 200);
  log('='.repeat(78));
  log('KASUS GAGAL YANG DITANGANI');
  log();
  await step(s, 'G-01', 'employeeId EMP-001 (data uji F-4) tidak dikenal API F-2: pengajuan ditolak', 'POST', '/api/v1/leave-requests', 'token-uji-karyawan', draft, 404);
  await step(s, 'G-01a', 'Kondisi data: tidak ada pengajuan baru 23-24 November untuk EMP-001', 'GET', '/api/v1/leave-requests?scope=mine', 'token-uji-karyawan', null, 200);
  await step(s, 'G-02', 'Rina Maharani (statusKerja kontrak di F-2) mengajukan: ditolak karena status kerja belum diatur', 'POST', '/api/v1/leave-requests', 'token-uji-karyawan-f2-kontrak', draft, 403);
  await step(s, 'G-03', 'Pemeriksaan akses: tanpa token ditolak sebelum memanggil F-2', 'POST', '/api/v1/leave-requests', null, draft, 401);
  await step(s, 'G-04', 'Pemeriksaan akses: karyawan lain (EMP-003) membuka pengajuan Sandy Walsh', 'GET', `/api/v1/leave-requests/${id}`, 'token-uji-karyawan-2', null, 403);
  await s.close();

  const down = await startServer(DEMO, { employees: { ...live, baseUrl: 'http://127.0.0.1:9', timeoutMs: 1500 } });
  await step(down, 'G-05', 'Layanan F-2 tidak terjangkau (base URL salah/layanan mati): pengajuan tidak diteruskan', 'POST', '/api/v1/leave-requests', 'token-uji-karyawan-f2', draft, 503);
  await step(down, 'G-05a', 'Kondisi data: tidak ada pengajuan tersimpan untuk Sandy Walsh', 'GET', '/api/v1/leave-requests?scope=mine', 'token-uji-karyawan-f2', null, 200);
  await down.close();

  const dir = path.join(__dirname, '..', 'bukti');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'p6-integrasi-f2-responses.json'), `${JSON.stringify(responses, null, 2)}\n`);
  const ok = responses.length === 13 && !process.exitCode;
  log(ok ? 'HASIL: 13 langkah sesuai harapan.' : 'HASIL: ADA LANGKAH YANG TIDAK SESUAI HARAPAN, periksa tanda DIHARAPKAN di atas.');
  fs.writeFileSync(path.join(dir, 'p6-integrasi-f2-log.txt'), `${lines.join('\n')}\n`);
  console.log('Log integrasi disimpan di bukti/p6-integrasi-f2-log.txt');
})();
