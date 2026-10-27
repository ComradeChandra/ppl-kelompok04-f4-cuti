'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createClock } = require('./clock');
const D = require('./dates');
const { UUID_V7, UUID_ANY, EXTERNAL_ID, uuidv7 } = require('./ids');

const OPENAPI_FILE = path.join(__dirname, '..', 'openapi', 'openapi.yaml');
const LEAVE_TYPES = ['ANNUAL', 'SICK', 'MENSTRUAL', 'MATERNITY'];
const STATUSES = ['DRAFT', 'PENDING_COO', 'PENDING_CEO', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'];
const ACTIVE = ['PENDING_COO', 'PENDING_CEO', 'APPROVED'];
const BLOCKING = ['DRAFT', ...ACTIVE]; // status yang dihitung untuk bentrok tanggal
const EDITABLE = ['leaveType', 'startDate', 'endDate', 'reason', 'attachmentIds'];
const PENDING = ['PENDING_COO', 'PENDING_CEO'];

class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
const fail = (status, code, message) => {
  throw new ApiError(status, code, message);
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 1e6) reject(new ApiError(400, 'VALIDATION_ERROR', 'Body terlalu besar.'));
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new ApiError(400, 'VALIDATION_ERROR', 'Body harus berupa JSON yang valid.'));
      }
    });
    req.on('error', reject);
  });
}

function createApp(seedFile, options = {}) {
  const seed = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
  const clock = options.clock || createClock(options.demoToday || null);
  const policy = seed.policy;
  const holidays = new Set(seed.holidays.map((h) => h.date)); // mock kalender F-3
  const employees = new Map(seed.employees.map((e) => [e.employeeId, e])); // mock referensi F-2
  // Data F-4 disimpan di memori dan selalu dimuat ulang dari seed saat layanan dijalankan.
  const requests = structuredClone(seed.leaveRequests);
  const balances = structuredClone(seed.balances);
  const ledger = structuredClone(seed.ledger);
  const notifications = [];

  const newId = () => uuidv7(new Date(clock.nowIso()).getTime());

  // ---------- autentikasi (mock F-1) ----------
  function auth(req) {
    const m = (req.headers.authorization || '').match(/^Bearer (.+)$/);
    const account = m && seed.testTokens[m[1]];
    if (!account) fail(401, 'UNAUTHORIZED', 'Sesi berakhir, silakan login kembali.');
    return account;
  }
  const forbid = (msg = 'Anda tidak memiliki akses ke data ini.') => fail(403, 'FORBIDDEN', msg);

  // ---------- aturan bantu ----------
  const workingDays = (a, b) => D.countWorkingDays(a, b, holidays);
  const eligibleFrom = (emp) => (emp.hireDate ? D.addMonths(emp.hireDate, policy.ANNUAL_MIN_SERVICE_MONTHS) : null);
  const yearOf = (date) => Number(date.slice(0, 4));

  function parseYear(url) {
    const p = url.searchParams.get('year');
    const year = p === null ? yearOf(clock.today()) : Number(p);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) fail(400, 'VALIDATION_ERROR', 'Parameter year tidak valid.');
    return year;
  }
  const getBalance = (employeeId, year) => balances.find((b) => b.employeeId === employeeId && b.year === year) || null;
  function pendingAnnualDays(employeeId, year) {
    return requests
      .filter((r) => r.employeeId === employeeId && r.leaveType === 'ANNUAL' && PENDING.includes(r.status) && yearOf(r.startDate) === year)
      .reduce((s, r) => s + r.workingDays, 0);
  }
  function changeBalance(employeeId, year, delta, entryType, leaveRequestId, actorUserId) {
    const b = getBalance(employeeId, year);
    if (!b) fail(422, 'INSUFFICIENT_BALANCE', 'Saldo cuti tahunan belum tersedia.');
    b.usedDays -= delta;
    b.remainingDays += delta;
    ledger.push({ entryId: newId(), employeeId, year, leaveRequestId, entryType, changeDays: delta, reason: null, actorUserId, createdAt: clock.nowIso() });
  }
  function notify(recipientUserId, leaveRequestId, type) {
    if (!recipientUserId) return;
    notifications.push({ notificationId: newId(), recipientUserId, leaveRequestId, type, readAt: null, createdAt: clock.nowIso() });
  }
  const tokens = Object.values(seed.testTokens);
  const userIdOf = (employeeId) => tokens.find((t) => t.employeeId === employeeId)?.userId || null;
  const userOfRole = (role) => tokens.find((t) => t.role === role)?.userId || null;

  // Gugur otomatis (Q-11): pengajuan yang belum diputus saat tanggal mulai tiba menjadi EXPIRED,
  // kecuali pengajuan yang dikirim pada atau setelah tanggal mulai (cuti sakit susulan, asumsi Q-17).
  function expireDue() {
    const today = clock.today();
    for (const r of requests) {
      const submittedOn = r.submittedOn || r.createdAt.slice(0, 10);
      if (PENDING.includes(r.status) && r.startDate <= today && submittedOn < r.startDate) {
        r.status = 'EXPIRED';
        r.updatedAt = clock.nowIso();
        notify(userIdOf(r.employeeId), r.leaveRequestId, 'EXPIRED');
      }
    }
  }

  const summary = (r) => ({
    leaveRequestId: r.leaveRequestId,
    employeeId: r.employeeId,
    employeeName: employees.get(r.employeeId)?.displayName ?? null,
    leaveType: r.leaveType,
    startDate: r.startDate,
    endDate: r.endDate,
    workingDays: r.workingDays,
    status: r.status,
    createdAt: r.createdAt,
  });
  const detail = (r) => ({
    ...summary(r),
    reason: r.reason,
    attachments: r.attachmentIds.map((id) => ({ attachmentId: id, fileName: 'lampiran.pdf' })),
    decisions: r.decisions.map(({ stage, decision, reason, decidedAt }) => ({ stage, decision, reason, decidedAt })),
    cancelledAt: r.cancelledAt,
    updatedAt: r.updatedAt,
  });
  const createdView = (r) => ({
    leaveRequestId: r.leaveRequestId, employeeId: r.employeeId, leaveType: r.leaveType, startDate: r.startDate,
    endDate: r.endDate, workingDays: r.workingDays, status: r.status, createdAt: r.createdAt,
  });
  function findRequest(id) {
    if (!UUID_V7.test(id)) fail(400, 'VALIDATION_ERROR', 'leaveRequestId harus berformat UUID v7.');
    const r = requests.find((x) => x.leaveRequestId === id);
    if (!r) fail(404, 'LEAVE_REQUEST_NOT_FOUND', 'Pengajuan cuti tidak ditemukan.');
    return r;
  }
  function canRead(account, r) {
    if (account.role === 'HR' || account.employeeId === r.employeeId) return true;
    if (r.status === 'DRAFT') return false;
    if (account.role === 'COO' && r.status === 'PENDING_COO') return true;
    if (account.role === 'CEO' && r.status === 'PENDING_CEO') return true;
    return ['COO', 'CEO'].includes(account.role) && r.decisions.some((d) => d.approverUserId === account.userId);
  }

  // ---------- API-K04-01 ----------
  function getLeaveBalance(account, employeeId, url) {
    if (!EXTERNAL_ID.test(employeeId)) fail(400, 'INVALID_EMPLOYEE_ID', 'employeeId tidak valid. Gunakan ID dari referensi karyawan Kelompok 2, contoh EMP-001.');
    const emp = employees.get(employeeId);
    if (!emp) fail(404, 'EMPLOYEE_NOT_FOUND', 'Karyawan tidak ditemukan.');
    const wanted = account.role === 'COO' ? 'PENDING_COO' : 'PENDING_CEO';
    const isApprover = ['COO', 'CEO'].includes(account.role) && requests.some((r) => r.employeeId === employeeId && r.status === wanted);
    if (account.employeeId !== employeeId && !isApprover && account.role !== 'HR') forbid();
    const year = parseYear(url);
    const from = eligibleFrom(emp);
    const b = getBalance(employeeId, year);
    const eligible = Boolean(b) && from !== null && from <= clock.today();
    const pendingDays = eligible ? pendingAnnualDays(employeeId, year) : 0;
    return [200, {
      employeeId,
      year,
      eligible,
      eligibleFrom: from,
      entitlementDays: eligible ? b.entitlementDays : 0,
      usedDays: eligible ? b.usedDays : 0,
      remainingDays: eligible ? b.remainingDays : 0,
      pendingDays,
      availableDays: eligible ? Math.max(0, b.remainingDays - pendingDays) : 0,
      expiresOn: `${year}-12-31`,
    }];
  }

  // ---------- API-K04-02 ----------
  function listLeaveRequests(account, url) {
    const scope = url.searchParams.get('scope') || 'mine';
    const status = url.searchParams.get('status');
    if (!['mine', 'approval'].includes(scope)) fail(400, 'VALIDATION_ERROR', 'scope harus mine atau approval.');
    if (status !== null && !STATUSES.includes(status)) fail(400, 'VALIDATION_ERROR', 'status tidak valid.');
    const year = parseYear(url);
    let items;
    if (scope === 'approval') {
      if (!['COO', 'CEO'].includes(account.role)) forbid();
      const wanted = account.role === 'COO' ? 'PENDING_COO' : 'PENDING_CEO';
      items = requests.filter((r) => r.status === wanted && r.employeeId !== account.employeeId)
        .sort((a, b) => a.startDate.localeCompare(b.startDate));
    } else {
      if (!account.employeeId) forbid();
      items = requests.filter((r) => r.employeeId === account.employeeId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    items = items.filter((r) => yearOf(r.startDate) === year && (status === null || r.status === status));
    return [200, { items: items.map(summary) }];
  }

  function getLeaveRequest(account, id) {
    const r = findRequest(id);
    if (!canRead(account, r)) forbid();
    return [200, detail(r)];
  }

  // ---------- validasi bersama untuk buat, ubah draf, dan kirim draf ----------
  function requesterOf(account) {
    if (!account.employeeId) forbid();
    const emp = employees.get(account.employeeId);
    if (!emp) fail(404, 'EMPLOYEE_NOT_FOUND', 'Karyawan tidak ditemukan di referensi karyawan. Hubungi HR untuk memeriksa data akun Anda.');
    if (!emp.active) forbid('Akun tidak terhubung ke karyawan aktif.');
    if (emp.employmentType !== 'EMPLOYEE') forbid('Tenaga ahli tidak dapat mengajukan cuti melalui sistem.');
    return emp;
  }

  function checkFields(f) {
    const attachmentIds = f.attachmentIds ?? [];
    if (!LEAVE_TYPES.includes(f.leaveType)) fail(400, 'VALIDATION_ERROR', 'leaveType wajib salah satu dari ANNUAL, SICK, MENSTRUAL, MATERNITY.');
    if (!D.isValidDate(f.startDate) || !D.isValidDate(f.endDate)) fail(400, 'VALIDATION_ERROR', 'Format tanggal harus YYYY-MM-DD.');
    if (f.endDate < f.startDate) fail(400, 'VALIDATION_ERROR', 'Tanggal akhir tidak boleh sebelum tanggal mulai. Perbaiki tanggal akhir.');
    if (typeof f.reason !== 'string' || f.reason.trim().length === 0 || f.reason.length > 500) {
      fail(400, 'VALIDATION_ERROR', 'Alasan cuti wajib diisi (1-500 karakter).');
    }
    if (!Array.isArray(attachmentIds) || attachmentIds.some((a) => typeof a !== 'string' || !UUID_V7.test(a))) {
      fail(400, 'VALIDATION_ERROR', 'attachmentIds harus berupa daftar UUID v7.');
    }
  }

  // Aturan bisnis cuti. excludeId dipakai saat mengubah atau mengirim draf agar draf itu sendiri tidak dihitung bentrok.
  function checkRules(emp, f, excludeId = null) {
    const { leaveType, startDate, endDate } = f;
    const attachmentIds = f.attachmentIds ?? [];
    const today = clock.today();
    const wd = workingDays(startDate, endDate);
    if (wd < 1) fail(400, 'VALIDATION_ERROR', 'Rentang tanggal tidak memuat hari kerja.');
    if (leaveType === 'ANNUAL') {
      const from = eligibleFrom(emp);
      if (!from || from > today) fail(422, 'NOT_ELIGIBLE', `Anda berhak cuti tahunan mulai ${from} (12 bulan masa kerja).`);
      if (yearOf(startDate) !== yearOf(endDate)) {
        fail(422, 'CROSS_YEAR_NOT_ALLOWED', 'Cuti tahunan tidak boleh melewati 31 Desember. Ajukan dalam dua pengajuan terpisah.');
      }
      if (startDate < D.addWorkingDays(today, policy.ANNUAL_MIN_NOTICE_WORKDAYS, holidays)) {
        fail(422, 'DEADLINE_H7', 'Cuti tahunan diajukan paling lambat 7 hari kerja sebelum tanggal mulai.');
      }
      const b = getBalance(emp.employeeId, yearOf(startDate));
      const available = b ? b.remainingDays - pendingAnnualDays(emp.employeeId, yearOf(startDate)) : 0;
      if (wd > available) fail(422, 'INSUFFICIENT_BALANCE', `Saldo dapat diajukan ${Math.max(0, available)} hari, pengajuan ${wd} hari kerja.`);
    }
    if (['SICK', 'MATERNITY'].includes(leaveType) && attachmentIds.length === 0) {
      fail(422, 'ATTACHMENT_REQUIRED', leaveType === 'SICK' ? 'Surat dokter wajib dilampirkan.' : 'Surat keterangan dokter/bidan wajib dilampirkan.');
    }
    if (leaveType === 'SICK' && today > D.addWorkingDays(endDate, policy.SICK_BACKDATE_MAX_WORKDAYS, holidays)) {
      fail(422, 'SICK_BACKDATE_LIMIT', 'Cuti sakit susulan diajukan paling lambat 3 hari kerja setelah kembali bekerja.');
    }
    if (leaveType === 'MENSTRUAL') {
      const month = startDate.slice(0, 7);
      const used = requests
        .filter((r) => r.leaveRequestId !== excludeId && r.employeeId === emp.employeeId && r.leaveType === 'MENSTRUAL' && ACTIVE.includes(r.status) && r.startDate.slice(0, 7) === month)
        .reduce((s, r) => s + r.workingDays, 0);
      if (endDate.slice(0, 7) !== month || used + wd > policy.MENSTRUAL_MAX_DAYS_PER_MONTH) {
        fail(422, 'MENSTRUAL_LIMIT', 'Cuti haid maksimal 2 hari per bulan.');
      }
    }
    const overlap = requests.some((r) => r.leaveRequestId !== excludeId && r.employeeId === emp.employeeId
      && BLOCKING.includes(r.status) && r.startDate <= endDate && r.endDate >= startDate);
    if (overlap) fail(409, 'DATE_OVERLAP', 'Tanggal cuti bertumpuk dengan pengajuan lain milik Anda (termasuk draf). Pilih tanggal lain atau ubah pengajuan yang sudah ada.');
    return wd;
  }

  // Status awal saat dikirim: PENDING_COO; pengaju COO → PENDING_CEO; cuti CEO dan cuti haid → APPROVED.
  function sendForApproval(account, r) {
    let status = 'PENDING_COO';
    if (account.role === 'COO') status = 'PENDING_CEO';
    if (account.role === 'CEO' || r.leaveType === 'MENSTRUAL') status = 'APPROVED';
    r.status = status;
    r.submittedOn = clock.today();
    if (status === 'APPROVED' && r.leaveType === 'ANNUAL') changeBalance(r.employeeId, yearOf(r.startDate), -r.workingDays, 'USAGE', r.leaveRequestId, null);
    if (r.leaveType === 'MENSTRUAL') notify(userOfRole('COO'), r.leaveRequestId, 'MENSTRUAL_NOTICE');
    else if (status === 'PENDING_COO') notify(userOfRole('COO'), r.leaveRequestId, 'SUBMITTED');
    else if (status === 'PENDING_CEO') notify(userOfRole('CEO'), r.leaveRequestId, 'SUBMITTED');
  }

  // ---------- API-K04-03 ----------
  function createLeaveRequest(account, body, idemKey) {
    const emp = requesterOf(account);
    if (idemKey !== undefined) {
      if (!UUID_ANY.test(idemKey)) fail(400, 'VALIDATION_ERROR', 'Idempotency-Key harus berformat UUID.');
      const prev = requests.find((r) => r.employeeId === emp.employeeId && r.idempotencyKey === idemKey);
      if (prev) return [201, createdView(prev)];
    }
    const f = body || {};
    if (f.submit !== undefined && typeof f.submit !== 'boolean') fail(400, 'VALIDATION_ERROR', 'submit harus bernilai true atau false.');
    checkFields(f);
    const wd = checkRules(emp, f);
    const now = clock.nowIso();
    const r = {
      leaveRequestId: newId(), employeeId: emp.employeeId, leaveType: f.leaveType, startDate: f.startDate, endDate: f.endDate, workingDays: wd,
      reason: f.reason.trim(), attachmentIds: f.attachmentIds ?? [], status: 'DRAFT', idempotencyKey: idemKey ?? null,
      createdAt: now, updatedAt: now, cancelledAt: null, decisions: [],
    };
    requests.push(r);
    if (f.submit !== false) sendForApproval(account, r);
    return [201, createdView(r)];
  }

  // ---------- API-K04-11: ubah draf ----------
  function updateDraft(account, id, body) {
    const r = findRequest(id);
    if (r.employeeId !== account.employeeId) forbid();
    if (r.status !== 'DRAFT') fail(409, 'INVALID_STATE', 'Pengajuan yang sudah dikirim tidak dapat diubah.');
    const patch = body || {};
    const unknown = Object.keys(patch).filter((k) => !EDITABLE.includes(k));
    if (unknown.length) fail(400, 'VALIDATION_ERROR', `Field berikut tidak dapat diubah: ${unknown.join(', ')}.`);
    if (Object.keys(patch).length === 0) fail(400, 'VALIDATION_ERROR', 'Tidak ada field yang diubah.');
    const merged = { leaveType: r.leaveType, startDate: r.startDate, endDate: r.endDate, reason: r.reason, attachmentIds: r.attachmentIds, ...patch };
    const emp = requesterOf(account);
    checkFields(merged);
    const wd = checkRules(emp, merged, r.leaveRequestId);
    // Semua pemeriksaan lolos; baru sekarang data ditulis sehingga penolakan tidak meninggalkan perubahan sebagian.
    Object.assign(r, { leaveType: merged.leaveType, startDate: merged.startDate, endDate: merged.endDate, reason: merged.reason.trim(), attachmentIds: merged.attachmentIds, workingDays: wd, updatedAt: clock.nowIso() });
    return [200, detail(r)];
  }

  // ---------- API-K04-12: kirim draf ----------
  function submitDraft(account, id) {
    const r = findRequest(id);
    if (r.employeeId !== account.employeeId) forbid();
    if (r.status !== 'DRAFT') fail(409, 'INVALID_STATE', 'Pengajuan ini sudah dikirim.');
    const emp = requesterOf(account);
    r.workingDays = checkRules(emp, r, r.leaveRequestId);
    r.updatedAt = clock.nowIso();
    sendForApproval(account, r);
    return [200, createdView(r)];
  }

  // ---------- API-K04-04 ----------
  function decideLeaveRequest(account, id, body) {
    if (!['COO', 'CEO'].includes(account.role)) forbid();
    const { decision, reason } = body || {};
    if (!['APPROVE', 'REJECT'].includes(decision)) fail(400, 'VALIDATION_ERROR', 'decision harus APPROVE atau REJECT.');
    if (reason !== undefined && reason !== null && (typeof reason !== 'string' || reason.length > 500)) {
      fail(400, 'VALIDATION_ERROR', 'reason maksimal 500 karakter.');
    }
    const r = findRequest(id);
    if (r.employeeId === account.employeeId) forbid('Penyetuju tidak dapat memutus pengajuan miliknya sendiri.');
    const stage = account.role;
    if (r.status !== `PENDING_${stage}`) fail(409, 'INVALID_STATE', 'Pengajuan ini sudah diproses. Muat ulang halaman.');
    if (decision === 'REJECT' && (typeof reason !== 'string' || reason.trim() === '')) {
      fail(422, 'REASON_REQUIRED', 'Alasan penolakan wajib diisi.');
    }
    const year = yearOf(r.startDate);
    if (decision === 'APPROVE' && stage === 'CEO' && r.leaveType === 'ANNUAL') {
      const b = getBalance(r.employeeId, year);
      if (!b || b.remainingDays < r.workingDays) fail(422, 'INSUFFICIENT_BALANCE', 'Saldo pemohon tidak mencukupi. Pengajuan tidak dapat disetujui.');
    }
    const decidedAt = clock.nowIso();
    const cleanReason = decision === 'REJECT' ? reason.trim() : null;
    r.decisions.push({ approvalId: newId(), stage, decision, approverUserId: account.userId, reason: cleanReason, decidedAt });
    if (decision === 'REJECT') r.status = 'REJECTED';
    else r.status = stage === 'COO' ? 'PENDING_CEO' : 'APPROVED';
    r.updatedAt = decidedAt;
    if (r.status === 'APPROVED' && r.leaveType === 'ANNUAL') changeBalance(r.employeeId, year, -r.workingDays, 'USAGE', r.leaveRequestId, null);
    if (r.status === 'PENDING_CEO') notify(userOfRole('CEO'), r.leaveRequestId, 'SUBMITTED');
    else notify(userIdOf(r.employeeId), r.leaveRequestId, r.status);
    return [200, { leaveRequestId: r.leaveRequestId, status: r.status, stage, decidedBy: account.userId, decidedAt, reason: cleanReason }];
  }

  // ---------- API-K04-05 ----------
  function cancelLeaveRequest(account, id) {
    const r = findRequest(id);
    if (r.employeeId !== account.employeeId) forbid();
    if (!BLOCKING.includes(r.status) || r.startDate <= clock.today()) {
      fail(409, 'INVALID_STATE', 'Pengajuan tidak dapat dibatalkan karena status sudah final atau tanggal mulai sudah lewat.');
    }
    const wasApproved = r.status === 'APPROVED';
    r.status = 'CANCELLED';
    r.cancelledAt = clock.nowIso();
    r.updatedAt = r.cancelledAt;
    if (wasApproved && r.leaveType === 'ANNUAL') changeBalance(r.employeeId, yearOf(r.startDate), r.workingDays, 'REFUND', r.leaveRequestId, account.userId);
    return [200, { leaveRequestId: r.leaveRequestId, status: r.status, cancelledAt: r.cancelledAt }];
  }

  // ---------- API-K04-07 ----------
  function getLeaveStatus(account, url) {
    if (!['SERVICE_F3', 'SERVICE_F5'].includes(account.role)) forbid();
    const employeeId = url.searchParams.get('employeeId');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    if (!employeeId || !from || !to) fail(400, 'VALIDATION_ERROR', 'Parameter employeeId, from, dan to wajib diisi.');
    if (!EXTERNAL_ID.test(employeeId)) fail(400, 'INVALID_EMPLOYEE_ID', 'employeeId tidak valid. Gunakan ID dari referensi karyawan Kelompok 2, contoh EMP-001.');
    if (!D.isValidDate(from) || !D.isValidDate(to)) fail(400, 'VALIDATION_ERROR', 'Format tanggal harus YYYY-MM-DD.');
    if (to < from) fail(400, 'INVALID_DATE_RANGE', 'Tanggal to tidak boleh sebelum from.');
    if (D.daysInclusive(from, to) > policy.MAX_STATUS_RANGE_DAYS) {
      fail(400, 'RANGE_TOO_LONG', `Rentang tanggal maksimal ${policy.MAX_STATUS_RANGE_DAYS} hari, termasuk tanggal awal dan akhir.`);
    }
    if (!employees.has(employeeId)) fail(404, 'EMPLOYEE_NOT_FOUND', 'Karyawan tidak ditemukan.');
    const items = requests
      .filter((r) => r.employeeId === employeeId && r.status === 'APPROVED' && r.startDate <= to && r.endDate >= from)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .map((r) => ({
        leaveRequestId: r.leaveRequestId,
        leaveType: r.leaveType,
        startDate: r.startDate,
        endDate: r.endDate,
        workingDays: r.workingDays,
        workingDaysInRange: workingDays(r.startDate > from ? r.startDate : from, r.endDate < to ? r.endDate : to),
        status: r.status,
        paid: true,
        approvedAt: r.decisions.length ? r.decisions[r.decisions.length - 1].decidedAt : r.createdAt,
      }));
    return [200, { employeeId, items }];
  }

  // ---------- API-K04-09 ----------
  function listBalanceLedger(account, employeeId, url) {
    if (!EXTERNAL_ID.test(employeeId)) fail(400, 'INVALID_EMPLOYEE_ID', 'employeeId tidak valid. Gunakan ID dari referensi karyawan Kelompok 2, contoh EMP-001.');
    if (!employees.has(employeeId)) fail(404, 'EMPLOYEE_NOT_FOUND', 'Karyawan tidak ditemukan.');
    if (account.employeeId !== employeeId && account.role !== 'HR') forbid();
    const year = parseYear(url);
    const items = ledger.filter((e) => e.employeeId === employeeId && e.year === year)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(({ entryId, entryType, changeDays, leaveRequestId, reason, createdAt }) => ({ entryId, entryType, changeDays, leaveRequestId, reason, createdAt }));
    return [200, { employeeId, year, items }];
  }

  // ---------- API-K04-10 ----------
  function listNotifications(account, url) {
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
    const items = notifications.filter((n) => n.recipientUserId === account.userId && (!unreadOnly || n.readAt === null))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(({ notificationId, leaveRequestId, type, readAt, createdAt }) => ({ notificationId, leaveRequestId, type, readAt, createdAt }));
    return [200, { items }];
  }
  function markNotificationRead(account, id) {
    const n = notifications.find((x) => x.notificationId === id);
    if (!n) fail(404, 'NOTIFICATION_NOT_FOUND', 'Notifikasi tidak ditemukan.');
    if (n.recipientUserId !== account.userId) forbid();
    if (!n.readAt) n.readAt = clock.nowIso();
    return [200, { notificationId: n.notificationId, readAt: n.readAt }];
  }

  // ---------- router ----------
  const routes = [
    ['GET', /^\/api\/v1\/leave-balances\/([^/]+)$/, (a, m, url) => getLeaveBalance(a, m[1], url)],
    ['GET', /^\/api\/v1\/leave-balances\/([^/]+)\/ledger$/, (a, m, url) => listBalanceLedger(a, m[1], url)],
    ['GET', /^\/api\/v1\/leave-requests$/, (a, m, url) => listLeaveRequests(a, url)],
    ['POST', /^\/api\/v1\/leave-requests$/, (a, m, url, body, req) => createLeaveRequest(a, body, req.headers['idempotency-key'])],
    ['GET', /^\/api\/v1\/leave-requests\/([^/]+)$/, (a, m) => getLeaveRequest(a, m[1])],
    ['PATCH', /^\/api\/v1\/leave-requests\/([^/]+)$/, (a, m, url, body) => updateDraft(a, m[1], body)],
    ['POST', /^\/api\/v1\/leave-requests\/([^/]+)\/submit$/, (a, m) => submitDraft(a, m[1])],
    ['POST', /^\/api\/v1\/leave-requests\/([^/]+)\/decisions$/, (a, m, url, body) => decideLeaveRequest(a, m[1], body)],
    ['POST', /^\/api\/v1\/leave-requests\/([^/]+)\/cancel$/, (a, m) => cancelLeaveRequest(a, m[1])],
    ['GET', /^\/api\/v1\/leave-status$/, (a, m, url) => getLeaveStatus(a, url)],
    ['GET', /^\/api\/v1\/leave-notifications$/, (a, m, url) => listNotifications(a, url)],
    ['POST', /^\/api\/v1\/leave-notifications\/([^/]+)\/read$/, (a, m) => markNotificationRead(a, m[1])],
  ];

  function send(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
  }

  return async function handler(req, res) {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        return send(res, 200, { status: 'ok', service: 'f4-cuti', today: clock.today() });
      }
      if (req.method === 'GET' && url.pathname === '/openapi.yaml') {
        res.writeHead(200, { 'Content-Type': 'application/yaml; charset=utf-8' });
        return res.end(fs.readFileSync(OPENAPI_FILE));
      }
      const route = routes.find(([method, re]) => method === req.method && re.test(url.pathname));
      if (!route) fail(404, 'NOT_FOUND', 'Endpoint tidak ditemukan.');
      const account = auth(req);
      const body = ['POST', 'PATCH'].includes(req.method) ? await readBody(req) : undefined;
      expireDue();
      const [status, payload] = route[2](account, url.pathname.match(route[1]), url, body, req);
      return send(res, status, payload);
    } catch (err) {
      if (err instanceof ApiError) return send(res, err.status, { code: err.code, message: err.message });
      console.error(err);
      return send(res, 500, { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan pada server.' });
    }
  };
}

module.exports = { createApp };
