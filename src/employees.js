'use strict';
// Direktori referensi karyawan.
// Mode "seed": membaca seed/seed.json bagian employees (mock Kelompok 2).
// Mode "f2": memanggil API-K02-17 GET {F2_BASE_URL}/api/v1/referensi/sdm/{employeeId} milik Kelompok 2 (OpenAPI F-2 1.1.0).
// API-K02-17 belum memuat tanggal masuk kerja dan status aktif (INT-02), sehingga dua field itu sementara diambil dari
// seed/seed.json bagian employeeSupplements sampai Kelompok 2 menambahkannya.

class ReferenceError503 extends Error {
  constructor(message) {
    super(message);
    this.status = 503;
    this.code = 'REFERENCE_UNAVAILABLE';
  }
}

// statusKerja Kelompok 2 → jenis kerja F-4. Hanya karyawan yang dapat mengajukan cuti (Q-02).
// Nilai lain (kontrak, mitra, komisaris, direksi) belum diputuskan mitra dan ditandai OTHER (INT-07).
const STATUS_MAP = { karyawan: 'EMPLOYEE', tenaga_ahli: 'EXPERT' };

function createEmployeeDirectory({ seed, source = 'seed', baseUrl = '', token = '', timeoutMs = 3000, fetchImpl = fetch, onCall = null }) {
  const local = new Map(seed.employees.map((e) => [e.employeeId, e]));
  const supplements = seed.employeeSupplements || {};
  const cache = new Map();

  if (source !== 'f2') {
    return {
      mode: 'seed',
      async get(id) {
        return local.get(id) || null;
      },
      name: (id) => local.get(id)?.displayName ?? null,
    };
  }

  const root = baseUrl.replace(/\/+$/, '');
  return {
    mode: 'f2',
    async get(id) {
      const url = `${root}/api/v1/referensi/sdm/${encodeURIComponent(id)}`;
      // Jejak panggilan sisi konsumen: waktu UTC, method, URL, dan status respons F-2 (token tidak dicatat).
      const trace = (status, note) => {
        const entry = { at: new Date().toISOString(), method: 'GET', url, status, note };
        if (onCall) onCall(entry);
        if (process.env.F2_CALL_LOG === '1') console.log(`[panggilan F-2] ${entry.at} GET ${url} -> ${status}${note ? ` (${note})` : ''}`);
      };
      let res;
      try {
        res = await fetchImpl(url, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (err) {
        trace('-', `gagal terhubung: ${err.name}`);
        throw new ReferenceError503('Layanan referensi karyawan (Kelompok 2) tidak dapat dihubungi. Coba lagi beberapa saat.');
      }
      trace(res.status);
      if (res.status === 404) return null;
      if (res.status === 401 || res.status === 403) {
        throw new ReferenceError503('Layanan referensi karyawan (Kelompok 2) menolak akses layanan F-4. Hubungi admin sistem.');
      }
      if (res.status !== 200) {
        throw new ReferenceError503('Layanan referensi karyawan (Kelompok 2) sedang bermasalah. Coba lagi beberapa saat.');
      }
      const ref = await res.json();
      const extra = supplements[ref.employeeId] || {};
      const employee = {
        employeeId: ref.employeeId,
        displayName: ref.namaLengkap,
        employmentType: STATUS_MAP[ref.statusKerja] || 'OTHER',
        statusKerja: ref.statusKerja,
        hireDate: extra.hireDate ?? null,
        active: extra.active ?? true,
        source: 'f2',
      };
      cache.set(employee.employeeId, employee);
      return employee;
    },
    name: (id) => cache.get(id)?.displayName ?? null,
  };
}

module.exports = { createEmployeeDirectory, ReferenceError503 };
