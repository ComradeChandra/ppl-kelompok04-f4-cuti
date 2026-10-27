# F-4 Pengajuan dan Persetujuan Cuti

Repositori layanan F-4 Pengajuan dan Persetujuan Cuti untuk ERP PT Anaheim Nimbus Universal
(Proyek Perangkat Lunak, Kelas F, Kelompok 4).

Alur utama yang berjalan: **ajukan → validasi → keputusan COO/CEO → status**. Dependensi F-1 (token dan
peran), F-2 (data karyawan), dan F-3 (hari libur) memakai mock dari data seed sampai API kelompok
pemilik tersedia.

## Isi repositori

| Path | Isi |
|---|---|
| `openapi/openapi.yaml` | Kontrak OpenAPI 3.0.3 versi 1.1.0 (1.0.0 dibekukan untuk asesmen tengah semester; perubahan di `CHANGELOG.md`). |
| `openapi/examples/` | Contoh respons JSON fiktif yang sama dengan contoh di `openapi.yaml`. |
| `CHANGELOG.md` | Riwayat perubahan kontrak dan alasannya. |
| `src/` | Kode layanan Node.js tanpa dependensi tambahan. |
| `seed/seed.json` | Data fiktif: karyawan (mock F-2), token uji per peran (mock F-1), hari libur (mock F-3), saldo, dan pengajuan awal. |
| `test/` | Uji otomatis alur utama, kasus gagal, dan API-K04-07. |
| `scripts/demo.js` | Skrip demo alur utama minggu 4; hasilnya disimpan di `bukti/demo-log.txt`. |
| `scripts/uji-p5.js` | Uji pertemuan 5: buat, lihat, ubah draf dan validasi VAL-01 sampai VAL-05; hasilnya di `bukti/p5-log.txt`. |
| `bukti/` | Log dan respons mentah demo minggu 4 (`demo-*`) dan uji pertemuan 5 (`p5-*`). |
| `.env.example` | Konfigurasi contoh untuk lingkungan lokal. |
| `.github/workflows/check.yml` | CI: `npm ci`, `npm test`, `npm run build`, `npm run demo`, dan `npm run uji:p5` pada setiap push dan pull request. |

## Prasyarat

- Node.js 22 atau lebih baru (npm terpasang bersama Node.js)
- Database belum dipakai; data dimuat ke memori dari `seed/seed.json` setiap kali layanan dijalankan.

## Menjalankan aplikasi

```bash
cp .env.example .env      # Windows: copy .env.example .env
npm ci
npm start
```

Layanan berjalan di `http://localhost:3000`. `DEMO_TODAY=2026-10-27` pada `.env` mengunci tanggal
"hari ini" agar aturan H-7 dan gugur otomatis memberi hasil yang sama setiap kali didemokan.
Kosongkan nilainya untuk memakai tanggal berjalan (Asia/Jakarta).

Endpoint dasar: `GET /health` dan `GET /openapi.yaml`.

## Menjalankan demo alur utama

```bash
npm run demo
```

Skrip menjalankan layanan dari seed, lalu memanggil API secara berurutan:

1. Karyawan melihat saldo, lalu mengajukan cuti tahunan 2 sampai 4 November 2026 → `PENDING_COO`.
2. COO menyetujui → `PENDING_CEO`; CEO menyetujui → `APPROVED`, saldo berkurang dari 9 menjadi 6.
3. F-5 membaca status cuti November melalui API-K04-07.
4. Kasus ditolak: kurang dari H-7 hari kerja (422), melebihi saldo (422), COO memutus ulang (409),
   karyawan mencoba menyetujui (403).

Hasilnya tercetak di terminal dan tersimpan di `bukti/demo-log.txt`.

## Uji pertemuan 5: draf pengajuan dan validasi dasar

```bash
npm run uji:p5
```

Skrip menjalankan B-01 sampai B-13 pada tanggal demo 2026-10-27: buat draf (`submit: false`), lihat, ubah
dengan `PATCH`, lihat ulang, lalu kasus ditolak VAL-01 (tanggal bertumpuk, 409), VAL-02 (tanggal akhir
sebelum tanggal mulai, 400), VAL-03 (karyawan EMP-999 tidak dikenal, 404), VAL-04 (bukan pemilik 403;
sudah dikirim 409), VAL-05 (kurang dari H-7 hari kerja, 422), dan request tanpa token (401).
Hasilnya tersimpan di `bukti/p5-log.txt`.

```bash
# Buat draf, ubah draf, lalu kirim draf (ganti {id} dengan leaveRequestId dari respons pertama)
curl -X POST http://localhost:3000/api/v1/leave-requests \
  -H "Authorization: Bearer token-uji-karyawan" -H "Content-Type: application/json" \
  -d '{"leaveType":"ANNUAL","startDate":"2026-11-09","endDate":"2026-11-11","reason":"Menghadiri pernikahan saudara","submit":false}'
curl -X PATCH http://localhost:3000/api/v1/leave-requests/{id} \
  -H "Authorization: Bearer token-uji-karyawan" -H "Content-Type: application/json" \
  -d '{"endDate":"2026-11-12","reason":"Menghadiri pernikahan saudara di luar kota"}'
curl -X POST http://localhost:3000/api/v1/leave-requests/{id}/submit -H "Authorization: Bearer token-uji-karyawan"
```

## Mencoba manual dengan curl

```bash
# 1. Karyawan mengajukan cuti tahunan
curl -X POST http://localhost:3000/api/v1/leave-requests \
  -H "Authorization: Bearer token-uji-karyawan" -H "Content-Type: application/json" \
  -d '{"leaveType":"ANNUAL","startDate":"2026-11-02","endDate":"2026-11-04","reason":"Acara keluarga"}'

# 2. COO lalu CEO menyetujui (ganti {id} dengan leaveRequestId dari langkah 1)
curl -X POST http://localhost:3000/api/v1/leave-requests/{id}/decisions \
  -H "Authorization: Bearer token-uji-coo" -H "Content-Type: application/json" -d '{"decision":"APPROVE"}'
curl -X POST http://localhost:3000/api/v1/leave-requests/{id}/decisions \
  -H "Authorization: Bearer token-uji-ceo" -H "Content-Type: application/json" -d '{"decision":"APPROVE"}'

# 3. F-5 membaca status cuti
curl -H "Authorization: Bearer token-uji-f5" \
  "http://localhost:3000/api/v1/leave-status?employeeId=EMP-001&from=2026-11-01&to=2026-11-30"
```

## Menjalankan uji

```bash
npm test
npm run build
```

`npm test` menguji alur utama, validasi (H-7, saldo, kelayakan, lintas tahun, bentrok tanggal, tenaga ahli,
cuti sakit, cuti haid), transisi status (403, 409, 422), pembatalan, gugur otomatis, idempotensi, dan
API-K04-07 (200, 400, 401, 403, 404). `npm run build` memeriksa berkas wajib, keabsahan JSON, dan
memuat aplikasi.

## Data fiktif dan akun uji (mock F-1)

Token hanya untuk uji lokal, bukan token F-1 asli.

| Token | Peran | Karyawan |
|---|---|---|
| `token-uji-karyawan` | EMPLOYEE | EMP-001 Nadia Prameswari (berhak, sisa saldo 9 hari, 1 pengajuan menunggu) |
| `token-uji-karyawan-2` | EMPLOYEE | EMP-003 Sinta Maharani (karyawan lain, untuk uji kepemilikan) |
| `token-uji-karyawan-3` | EMPLOYEE | EMP-999 (tidak ada di referensi karyawan, untuk uji relasi data) |
| `token-uji-karyawan-baru` | EMPLOYEE | EMP-002 Raka Wiratama (masa kerja belum 12 bulan) |
| `token-uji-karyawan-sinta` | EMPLOYEE | EMP-003 Sinta Maharani (sudah 1 hari cuti haid Oktober) |
| `token-uji-tenaga-ahli` | EMPLOYEE | EMP-004 Laras Anindita (tenaga ahli, ditolak mengajukan) |
| `token-uji-coo` | COO | Bima Saputra |
| `token-uji-ceo` | CEO | Maya Lestari |
| `token-uji-hr` | HR | Dewi Kartika |
| `token-uji-f3` / `token-uji-f5` | Akun layanan F-3 / F-5 | - |

Data selalu kembali ke isi `seed/seed.json` setiap kali layanan dijalankan ulang.

## Mengganti mock dengan API asli

Bagian yang akan diganti ada di `src/app.js` (fungsi `auth` untuk token F-1, peta `employees` untuk
data F-2, dan `holidays` untuk kalender F-3). Setelah kelompok pemilik menerbitkan API, alamatnya
ditambahkan ke `.env` dan `npm run demo` dijalankan ulang dengan skenario yang sama.

## Membuka kontrak OpenAPI

- https://editor.swagger.io → File > Import URL →
  `https://raw.githubusercontent.com/ComradeChandra/ppl-kelompok04-f4-cuti/main/openapi/openapi.yaml`
- Mock dari kontrak: `npx @stoplight/prism-cli mock openapi/openapi.yaml` (berjalan di `http://127.0.0.1:4010`).

## Konvensi

- employeeId mengikuti seed bersama kelas dari Kelompok 2 (contoh `EMP-001`); ID yang diterbitkan F-4 dan userId berupa UUID v7.
- Tanggal cuti `YYYY-MM-DD`; waktu kejadian RFC 3339 UTC; zona bisnis Asia/Jakarta.
- Status cuti (draf dipakai sejak 1.1.0): `DRAFT`, `PENDING_COO`, `PENDING_CEO`, `APPROVED`, `REJECTED`, `CANCELLED`, `EXPIRED`.
- Kesalahan: `{ "code": "...", "message": "..." }`.
