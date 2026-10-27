'use strict';
// Jam aplikasi. Zona bisnis Asia/Jakarta untuk tanggal; waktu kejadian disimpan dalam UTC (RFC 3339).
// Bila demoToday diisi (YYYY-MM-DD), tanggal "hari ini" dikunci agar demo dan uji dapat diulang.

function jakartaToday(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(date);
}

function createClock(demoToday = null) {
  let tick = 0;
  return {
    today() {
      return demoToday || jakartaToday();
    },
    nowIso() {
      if (!demoToday) return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
      // 09:00 WIB pada tanggal demo, ditambah satu detik setiap kejadian agar urutan tetap.
      const base = new Date(`${demoToday}T02:00:00Z`).getTime() + tick * 1000;
      tick += 1;
      return new Date(base).toISOString().replace(/\.\d{3}Z$/, 'Z');
    },
  };
}

module.exports = { createClock };
