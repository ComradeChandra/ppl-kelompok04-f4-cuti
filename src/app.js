'use strict';
const fs = require('node:fs');
const path = require('node:path');

const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 31; // usulan F-4, menunggu konfirmasi F-5
const OPENAPI_FILE = path.join(__dirname, '..', 'openapi', 'openapi.yaml');

function isValidDate(s) {
  if (!DATE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function daysBetween(a, b) {
  return Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / 86400000);
}

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

const error = (res, status, code, message) => send(res, status, { code, message });

function authenticate(req, seed) {
  const header = req.headers.authorization || '';
  const m = header.match(/^Bearer (.+)$/);
  if (!m) return null;
  return seed.testTokens[m[1]] || null;
}

// API-K04-07: GET /api/v1/leave-status?employeeId=&from=&to=
function getLeaveStatus(req, res, url, seed) {
  const account = authenticate(req, seed);
  if (!account) return error(res, 401, 'UNAUTHORIZED', 'Sesi berakhir, silakan login kembali.');
  if (!['SERVICE_F3', 'SERVICE_F5'].includes(account.role)) {
    return error(res, 403, 'FORBIDDEN', 'Anda tidak memiliki akses ke data ini.');
  }

  const employeeId = url.searchParams.get('employeeId');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  if (!employeeId || !UUID_V7.test(employeeId)) {
    return error(res, 400, 'VALIDATION_ERROR', 'employeeId wajib diisi dengan format UUID v7.');
  }
  if (!from || !to || !isValidDate(from) || !isValidDate(to)) {
    return error(res, 400, 'VALIDATION_ERROR', 'Format tanggal harus YYYY-MM-DD.');
  }
  if (to < from) return error(res, 400, 'INVALID_DATE_RANGE', 'Tanggal to tidak boleh sebelum from.');
  if (daysBetween(from, to) + 1 > MAX_RANGE_DAYS) {
    return error(res, 400, 'INVALID_DATE_RANGE', `Rentang tanggal maksimal ${MAX_RANGE_DAYS} hari.`);
  }
  if (!seed.employees.some((e) => e.employeeId === employeeId)) {
    return error(res, 404, 'EMPLOYEE_NOT_FOUND', 'Karyawan tidak ditemukan.');
  }

  const items = seed.leaveRequests
    .filter((r) => r.employeeId === employeeId && r.status === 'APPROVED')
    .filter((r) => r.startDate <= to && r.endDate >= from)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map((r) => ({
      leaveRequestId: r.leaveRequestId,
      leaveType: r.leaveType,
      startDate: r.startDate,
      endDate: r.endDate,
      workingDays: r.workingDays,
      status: r.status,
      paid: true,
      approvedAt: r.approvedAt,
    }));

  return send(res, 200, { employeeId, items });
}

function createApp(seedFile) {
  const seed = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
  return function handler(req, res) {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/health') {
      return send(res, 200, { status: 'ok', service: 'f4-cuti' });
    }
    if (req.method === 'GET' && url.pathname === '/openapi.yaml') {
      res.writeHead(200, { 'Content-Type': 'application/yaml; charset=utf-8' });
      return res.end(fs.readFileSync(OPENAPI_FILE));
    }
    if (req.method === 'GET' && url.pathname === '/api/v1/leave-status') {
      return getLeaveStatus(req, res, url, seed);
    }
    return error(res, 404, 'NOT_FOUND', 'Endpoint tidak ditemukan.');
  };
}

module.exports = { createApp };
