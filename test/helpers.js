'use strict';
const http = require('node:http');
const path = require('node:path');
const { createApp } = require('../src/app');

const SEED = path.join(__dirname, '..', 'seed', 'seed.json');
const IDS = {
  nadia: 'EMP-001',
  raka: 'EMP-002',
  sinta: 'EMP-003',
  nadiaApproved: '0192f1b0-1d2e-7f30-8a4b-5c6d7e8f9a0b',
  nadiaPending: '0192f1b2-3c4d-7e5f-9a6b-7c8d9e0f1a2b',
};

// Menjalankan layanan baru dari seed untuk setiap pemanggilan, dengan tanggal demo yang dikunci.
async function startServer(demoToday = '2026-10-19') {
  const server = http.createServer(createApp(SEED, { demoToday }));
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  async function call(method, p, token, body, headers = {}) {
    const res = await fetch(base + p, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, body: await res.json() };
  }
  return { server, base, call, close: () => new Promise((r) => server.close(r)) };
}

module.exports = { startServer, IDS };
