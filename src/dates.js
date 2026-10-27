'use strict';
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(s) {
  if (typeof s !== 'string' || !DATE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function addDays(s, n) {
  const d = new Date(`${s}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function addMonths(s, n) {
  const [y, m, d] = s.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1 + n, d));
  return t.toISOString().slice(0, 10);
}

function daysInclusive(a, b) {
  return Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / 86400000) + 1;
}

function isWorkingDay(s, holidays) {
  const dow = new Date(`${s}T00:00:00Z`).getUTCDay();
  return dow !== 0 && dow !== 6 && !holidays.has(s);
}

// Jumlah hari kerja dari a sampai b (inklusif), di luar akhir pekan dan hari libur (kalender F-3).
function countWorkingDays(a, b, holidays) {
  let n = 0;
  for (let d = a; d <= b; d = addDays(d, 1)) if (isWorkingDay(d, holidays)) n += 1;
  return n;
}

// Tanggal hari kerja ke-n setelah s.
function addWorkingDays(s, n, holidays) {
  let d = s;
  let left = n;
  while (left > 0) {
    d = addDays(d, 1);
    if (isWorkingDay(d, holidays)) left -= 1;
  }
  return d;
}

module.exports = { isValidDate, addDays, addMonths, daysInclusive, countWorkingDays, addWorkingDays };
