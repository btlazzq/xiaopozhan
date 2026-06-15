/**
 * 首次部署：把镜像内已烘焙的 uploads 复制到 Volume（避免启动时逐个 copyAsset 过慢）
 */
const fs = require('fs');
const path = require('path');
const { uploadsDir, ensureUploadsDir } = require('./paths');

const bakedRoot = path.join(__dirname, '..', 'uploads');
const marker = path.join(uploadsDir, 'frontend-sync', 'intro.mp3');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const from = path.join(src, name);
    const to = path.join(dest, name);
    if (fs.statSync(from).isDirectory()) {
      copyRecursive(from, to);
    } else if (!fs.existsSync(to)) {
      fs.copyFileSync(from, to);
    }
  }
}

ensureUploadsDir();

if (!process.env.PERSIST_DIR) {
  process.exit(0);
}

if (!fs.existsSync(bakedRoot)) {
  console.warn('bootstrap-uploads: 镜像内无 uploads，跳过');
  process.exit(0);
}

if (fs.existsSync(marker)) {
  process.exit(0);
}

console.log('正在从镜像初始化 Volume 媒体文件...');
copyRecursive(bakedRoot, uploadsDir);
console.log('Volume 媒体初始化完成');
