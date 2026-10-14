'use strict';
const http = require('node:http');
const { getConfig } = require('./config');
const { createApp } = require('./app');

const config = getConfig();
http.createServer(createApp(config.seedFile)).listen(config.port, () => {
  console.log(`Layanan F-4 berjalan di http://localhost:${config.port}`);
});
