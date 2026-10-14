'use strict';
const fs = require('node:fs');
const path = require('node:path');

// Membaca .env sederhana tanpa dependensi tambahan. Variabel lingkungan yang sudah ada tidak ditimpa.
function loadEnv(file = path.join(__dirname, '..', '.env')) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

function getConfig() {
  loadEnv();
  return {
    port: Number(process.env.PORT || 3000),
    seedFile: path.resolve(__dirname, '..', process.env.SEED_FILE || 'seed/seed.json'),
  };
}

module.exports = { getConfig };
