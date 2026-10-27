# Riwayat perubahan kontrak API F-4

Kontrak: `openapi/openapi.yaml`. Versi 1.0.0 dibekukan untuk asesmen tengah semester; setiap perubahan
setelah versi ini dicatat di berkas ini beserta alasan dan pihak yang menyetujui.

## 1.1.0 (2026-10-27), draf pengajuan dan format employeeId Kelompok 2

Perubahan untuk pertemuan 5 (operasi buat, lihat, dan ubah dengan validasi dasar):

- API-K04-03: field opsional `submit` (bawaan `true`); `false` menyimpan pengajuan sebagai `DRAFT`.
  Seluruh aturan validasi tetap dijalankan pada draf.
- API-K04-11 baru: `PATCH /api/v1/leave-requests/{leaveRequestId}` untuk mengubah draf (hanya pemilik,
  hanya status `DRAFT`; field leaveType, startDate, endDate, reason, attachmentIds).
- API-K04-12 baru: `POST /api/v1/leave-requests/{leaveRequestId}/submit` untuk mengirim draf.
- Bentrok tanggal (`409 DATE_OVERLAP`) kini juga memperhitungkan draf milik karyawan yang sama.
- API-K04-03: respons `404 EMPLOYEE_NOT_FOUND` bila employeeId dari token tidak ada di referensi karyawan.
- employeeId mengikuti seed bersama kelas dari Kelompok 2 (contoh `EMP-001`, materi pertemuan 5), bukan
  UUID v7. Skema baru `ExternalId`; ID yang diterbitkan F-4 tetap UUID v7. Menutup temuan T-01.
- Detail pengajuan (API-K04-02) kini memuat `updatedAt`.
- API-K04-05: draf dapat dibatalkan sebelum tanggal mulai.

Dampak bagi konsumen F-3 dan F-5: nilai employeeId pada API-K04-07 berubah menjadi format Kelompok 2
(contoh `EMP-001`); field dan status respons lain tidak berubah.

## 1.0.0 (2026-10-19), kontrak untuk asesmen tengah semester

Perubahan dari 0.1.0 berdasarkan review konsumen F-5 (18 Oktober 2026):

- API-K04-07: menambah field wajib `workingDaysInRange` (hari kerja cuti yang berada di dalam rentang
  `from` sampai `to`). `workingDays` tetap berisi total hari kerja seluruh pengajuan. Alasan: F-5
  membutuhkan jumlah hari per periode payroll untuk cuti lintas bulan.
- API-K04-07: rentang maksimal 31 hari termasuk tanggal awal dan akhir dikonfirmasi F-5; status
  "usulan" dihapus.
- API-K04-07: `leaveType` tetap dikirim untuk pencatatan; F-5 memakai `paid` untuk perhitungan dasar.
- API-K04-07: menambah contoh 400 untuk parameter kosong (`VALIDATION_ERROR`), employeeId bukan UUID v7
  (`INVALID_EMPLOYEE_ID`), dan rentang lebih dari 31 hari (`RANGE_TOO_LONG`), serta contoh cuti lintas bulan.
- API-K04-02 (detail) dan API-K04-05: menambah respons 400 bila leaveRequestId bukan UUID v7.
- `servers`: menambah layanan lokal `http://localhost:3000` di samping mock Prism.

Tidak ada field yang dihapus atau diganti namanya, sehingga konsumen versi 0.1.0 tetap dapat membaca respons.

## 0.1.0 (2026-10-11), versi awal

- Kontrak awal API-K04-01 sampai API-K04-10 untuk tugas OpenAPI versi awal (pertemuan 3).
