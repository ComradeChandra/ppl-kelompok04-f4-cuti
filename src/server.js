'use strict';
const http = require('node:http');
const { getConfig } = require('./config');
const { createApp } = require('./app');

const config = getConfig();
http.createServer(createApp(config.seedFile, { demoToday: config.demoToday, employees: config.employees })).listen(config.port, () => {
  console.log(`Layanan F-4 berjalan di http://localhost:${config.port}`);
  if (config.demoToday) console.log(`Tanggal demo dikunci: ${config.demoToday}`);
  console.log(config.employees.source === 'f2'
    ? `Referensi karyawan: API Kelompok 2 di ${config.employees.baseUrl}`
    : 'Referensi karyawan: mock seed/seed.json');
});
