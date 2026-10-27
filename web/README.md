# Antarmuka F-4 Pengajuan dan Persetujuan Cuti

Frontend modul F-4 (ERP PT Anaheim Nimbus Universal, Kelas F Kelompok 4). Struktur dan konvensinya mengikuti
acuan frontend RailFuel (`STRUKTUR-FOLDER-FE.md` dan skill `frontend-vite`), dengan rancangan dari board Figma kelompok.

| Hal | Isi |
|---|---|
| Stack | Vite 8, React 19, TypeScript (strict), Tailwind 4, react-router 8, npm |
| Font | Inter (sesuai Figma), di-host sendiri lewat `@fontsource-variable/inter` |
| Jalankan | `npm run dev` (UI di :5173) |
| Build | `npm run build` = `tsc -b && vite build`. Galat tipe menggagalkan build |
| Test | `npm test` (Vitest + Testing Library, jsdom) |
| Lint | `npm run lint` (oxlint) |
| Backend | Layanan F-4 di akar repo. FE hanya memanggil `/api/v1/...` lewat `callApi` di `src/lib/api.ts` |

## Menjalankan

```bash
# terminal 1, akar repo: layanan F-4 di :3000
npm start

# terminal 2, folder web/
npm ci
npm run dev            # http://localhost:5173
```

Vite meneruskan `/api` dan `/health` ke `http://localhost:3000` (ubah dengan `API_URL`), jadi UI dan API satu origin.
Akun dipilih di pojok kanan atas: token uji dari `seed/seed.json`, pengganti login Kelompok 1 sampai layanannya terbit.

## Layar

| Rute | Layar | Isi |
|---|---|---|
| `/cuti` | UI-K04-01 Daftar cuti dan saldo | Ringkasan saldo dan tabel pengajuan dengan penyaring tahun dan status |
| `/cuti/ajukan` | UI-K04-02 Form ajukan cuti | Buat, simpan draf, ubah draf, kirim. `?draf=<id>` membuka draf |
| `/cuti/:leaveRequestId` | UI-K04-04 Detail pengajuan | Ringkasan, linimasa COO lalu CEO, batalkan sebelum tanggal mulai |
| `/persetujuan` | UI-K04-03 Persetujuan cuti | Antrean COO/CEO, setujui atau tolak dengan alasan. Hanya akun COO dan CEO |
| `/beranda`, `/kehadiran`, `/payroll` | - | Modul kelompok lain, tampil "Fitur ini belum tersedia." |

## Pohon folder

```
src/
├── main.tsx              BrowserRouter, SessionProvider, NoticeProvider
├── app.tsx               merangkai peta rute
├── index.css             Tailwind + blok @theme (token warna Figma, font)
├── routes/               fragmen <Route> per kelompok menu: leave, approval, error
├── layouts/              app-layout, app-header, app-nav, account-switcher, notice-slot
├── pages/<area>/         halaman utuh: leave/, approval/, error/{wip,forbidden,not-found}/
├── components/
│   ├── atoms/            bebas domain: button, link-button, badge, field-label, field-error, date-field,
│   │                     text-area-field, read-only-field, icons/
│   ├── molecules/        bebas domain: alert-banner, segmented-control, single-select, popover,
│   │                     upload-zone, file-list
│   ├── organisms/        bebas domain: modal, confirm-modal, page-heading, card, timeline, state-panel
│   ├── navigation/       menu sidebar ERP (menu-items, nav-menu)
│   ├── leave/            menu Cuti, dipilah per layar: list/, form/, detail/
│   ├── approval/         menu Persetujuan cuti
│   ├── error/            error-panel, access-denied
│   ├── session/          session-expired (keadaan 401)
│   └── approver-route.tsx   penjaga rute COO/CEO
├── lib/                  api, leave-api, leave-labels, format-date, working-days, uuid,
│                         use-async, input-style, button-style, session/, notice/
├── types/                leave.ts (bentuk data API), ui.ts (tipe primitif lapisan)
└── vitest-setup.ts     setup Vitest (bukan di src/test/: node --test di akar repo memungut folder test/)
```

## Konvensi yang dipakai

- Nama berkas kebab-case dari simbol yang diekspor; pengenal kode Inggris, teks layar dan komentar Indonesia.
- Test bersebelahan dengan berkasnya sebagai `*.spec.ts(x)`, bukan `*.test.ts`: `node --test` di akar repo (uji layanan)
  otomatis memungut `*.test.ts` dan isi folder `test/` di mana pun, termasuk `web/`.
- Atom, molekul, dan organisme bebas domain: tidak memanggil API, sesi, atau `localStorage`. Komponen area boleh.
- Tidak ada berkas kode lewat 200 baris; atom di bawah 50, molekul di bawah 100. Tidak ada `export *`.
- Validasi formulir (board "sketsa input"): kolom bermasalah bertepi merah dan pesannya di bawah kolom. Formulir memakai `noValidate`.
  Ini menyimpang dari acuan RailFuel (pesan di toast) atas keputusan kelompok agar sama dengan Figma.
- Notifikasi: modal kalau butuh keputusan (Kirim, Setujui, Tolak, Batalkan); pita pesan di atas halaman untuk hasil
  (berhasil, gagal jaringan dengan "Coba lagi", sudah diproses dengan "Muat ulang"), sesuai board "sketsa input" dan "sketsa keadaan".
- Tidak ada tampilan bawaan browser: tanpa `<select>`, `alert`/`confirm`, atau `title=` sebagai tooltip.
- Teks layar tidak menyebut API, server, atau kode galat; kode galat ditempel sebagai `data-error-code` pada pita pesan.

## Batasan

- Unggah lampiran belum ke server: `POST /api/v1/leave-attachments` ada di kontrak tetapi belum diimplementasikan
  layanan v1.1.0, jadi `attachmentId` dibuat di peramban (lihat `components/leave/form/attachment-field.tsx`).
- Jumlah hari kerja sebelum disimpan berupa perkiraan Senin–Jumat (ditandai ±); angka final dari layanan.
- Halaman persetujuan belum menampilkan riwayat cuti pemohon karena API belum menyediakannya untuk COO/CEO.
