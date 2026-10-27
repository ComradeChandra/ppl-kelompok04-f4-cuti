'use strict';
// Pemeriksaan build sederhana: berkas wajib ada, seed dan contoh JSON valid, aplikasi dapat dimuat.
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const required = ['openapi/openapi.yaml', 'seed/seed.json', '.env.example', 'README.md', 'CHANGELOG.md'];
for (const f of required) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`Berkas wajib tidak ada: ${f}`);
}
const yaml = fs.readFileSync(path.join(root, 'openapi/openapi.yaml'), 'utf8');
for (const key of ['openapi:', 'info:', 'servers:', 'paths:', 'components:']) {
  if (!yaml.includes(`\n${key}`) && !yaml.startsWith(key)) throw new Error(`openapi.yaml tidak memuat ${key}`);
}
JSON.parse(fs.readFileSync(path.join(root, 'seed/seed.json'), 'utf8'));
const exDir = path.join(root, 'openapi/examples');
const examples = fs.readdirSync(exDir).filter((f) => f.endsWith('.json'));
for (const f of examples) JSON.parse(fs.readFileSync(path.join(exDir, f), 'utf8'));
require(path.join(root, 'src/app.js'));
console.log(`Pemeriksaan selesai: ${examples.length} contoh JSON valid, aplikasi dapat dimuat.`);
