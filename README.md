# F-4 Pengajuan dan Persetujuan Cuti

Repositori layanan F-4 Pengajuan dan Persetujuan Cuti untuk ERP PT Anaheim Nimbus Universal
(Proyek Perangkat Lunak, Kelas F, Kelompok 4).

Versi awal ini memuat kontrak OpenAPI, data fiktif (seed), satu endpoint dasar yang berjalan,
uji otomatis, dan CI GitHub Actions.

## Isi repositori

| Path | Isi |
|---|---|
| `openapi/openapi.yaml` | Kontrak OpenAPI 3.0.3 untuk seluruh API F-4 (API-K04-01 sampai API-K04-10). |
| `openapi/examples/` | Contoh respons JSON fiktif (berhasil dan gagal) yang sama dengan contoh di `openapi.yaml`. |
| `src/` | Kode layanan Node.js tanpa dependensi tambahan. |
| `seed/seed.json` | Data fiktif: 5 karyawan, pengajuan cuti, dan token uji per peran. |
| `test/` | Uji otomatis untuk endpoint API-K04-07. |
| `.env.example` | Konfigurasi contoh untuk lingkungan lokal. |
| `.github/workflows/check.yml` | CI: `npm ci`, `npm test`, dan `npm run build` pada setiap push dan pull request. |

## Prasyarat

- Node.js 22 atau lebih baru
- npm (terpasang bersama Node.js)

Database belum dipakai pada versi awal; data dibaca dari `seed/seed.json`.

## Menjalankan aplikasi

1. Salin konfigurasi contoh:
   ```bash
   cp .env.example .env
   ```
2. Pasang dependensi (tidak ada dependensi eksternal, perintah ini hanya memeriksa lockfile):
   ```bash
   npm ci
   ```
3. Jalankan layanan:
   ```bash
   npm start
   ```
   Layanan berjalan di `http://localhost:3000`.
4. Buka endpoint dasar:
   - `GET http://localhost:3000/health`
   - `GET http://localhost:3000/openapi.yaml`
   - API-K04-07 untuk F-3 dan F-5:
     ```bash
     curl -H "Authorization: Bearer token-uji-f3" \
       "http://localhost:3000/api/v1/leave-status?employeeId=0192f1a2-7c3e-7a10-9b2d-4e5f6a7b8c9d&from=2026-10-01&to=2026-10-31"
     ```

## Menjalankan uji

```bash
npm test
npm run build
```

`npm test` menguji API-K04-07 untuk respons 200, 200 kosong, 400, 401, 403, dan 404.
`npm run build` memeriksa berkas wajib, keabsahan JSON seed dan contoh, serta memuat aplikasi.

## Data fiktif dan akun uji

Seed menghasilkan data yang sama setiap kali dijalankan. Token di bawah hanya untuk uji lokal,
bukan token F-1 asli, dan tidak boleh dipakai di luar lingkungan uji.

| Token | Peran |
|---|---|
| `token-uji-f3` | Akun layanan F-3 (kehadiran) |
| `token-uji-f5` | Akun layanan F-5 (payroll) |
| `token-uji-karyawan` | Karyawan (Nadia Prameswari) |
| `token-uji-coo` | COO |
| `token-uji-ceo` | CEO |

Karyawan uji yang memiliki cuti APPROVED: `0192f1a2-7c3e-7a10-9b2d-4e5f6a7b8c9d` (Oktober 2026)
dan `0192f1a5-9e3f-7c42-b6d7-e8f9a0b1c2d3` (Oktober 2026). employeeId yang tidak ada di seed
menghasilkan 404.

## Membuka kontrak OpenAPI

- Buka https://editor.swagger.io, pilih File > Import file, lalu pilih `openapi/openapi.yaml`.
- Mock seluruh API dari kontrak (memerlukan koneksi internet untuk mengunduh Prism):
  ```bash
  npx @stoplight/prism-cli mock openapi/openapi.yaml
  ```
  Mock berjalan di `http://127.0.0.1:4010`.

## Mengembalikan lingkungan

Hapus `.env` lalu salin ulang dari `.env.example`. Seed hanya dibaca, tidak diubah, sehingga
data uji kembali sama setiap kali layanan dijalankan ulang.

## Konvensi

- ID: string UUID v7 dari layanan pemilik (employeeId dari F-2, userId dari F-1, ID cuti dari F-4).
- Tanggal cuti `YYYY-MM-DD`; waktu kejadian RFC 3339 UTC; zona bisnis Asia/Jakarta.
- Status cuti: `DRAFT`, `PENDING_COO`, `PENDING_CEO`, `APPROVED`, `REJECTED`, ditambah usulan F-4
  `CANCELLED` dan `EXPIRED`.
- Kesalahan: `{ "code": "...", "message": "..." }`.
- Autentikasi: token Bearer dari F-1.
