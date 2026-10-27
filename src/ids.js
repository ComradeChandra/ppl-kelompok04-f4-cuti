'use strict';
const crypto = require('node:crypto');

const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
// ID referensi dari layanan lain (contoh EMP-001 dari Kelompok 2): huruf, angka, dan tanda hubung, maks. 64 karakter.
const EXTERNAL_ID = /^[A-Za-z0-9][A-Za-z0-9-]{0,63}$/;
const UUID_ANY = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// UUID v7: 48 bit waktu (ms) + versi 7 + bit acak, sesuai RFC 9562.
function uuidv7(ms = Date.now()) {
  const b = crypto.randomBytes(16);
  const t = BigInt(ms);
  for (let i = 0; i < 6; i += 1) b[i] = Number((t >> BigInt(8 * (5 - i))) & 0xffn);
  b[6] = (b[6] & 0x0f) | 0x70;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = b.toString('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

module.exports = { UUID_V7, UUID_ANY, EXTERNAL_ID, uuidv7 };
