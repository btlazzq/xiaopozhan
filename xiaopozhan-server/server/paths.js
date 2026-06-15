const path = require('path');
const fs = require('fs');

// 本地默认：xiaopozhan-server/data 与 uploads
// Railway 单 Volume：挂到 /app/persist，并设置 PERSIST_DIR=/app/persist
const root = process.env.PERSIST_DIR || path.join(__dirname, '..');
const dataDir = path.join(root, 'data');
const uploadsDir = path.join(root, 'uploads');

function ensureDataDirs() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
}

module.exports = { root, dataDir, uploadsDir, ensureDataDirs, ensureUploadsDir };
