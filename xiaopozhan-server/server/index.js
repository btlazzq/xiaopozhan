const express = require('express');
const path = require('path');
const cors = require('cors');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const { getPublicOrigin } = require('./publicUrl');

const app = express();
const PORT = process.env.PORT || 3002;

const dbModule = require('./db');
if (typeof dbModule.ensureAssetsTable === 'function') {
  dbModule.ensureAssetsTable();
}

app.set('trust proxy', true);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const { uploadsDir } = require('./paths');
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsDir));
app.use('/admin', express.static(path.join(__dirname, '../admin')));

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: '服务器错误' });
});

app.listen(PORT, () => {
  const publicOrigin = getPublicOrigin();
  console.log(`\n  小破站 API 已启动`);
  console.log(`  API:  http://localhost:${PORT}/api`);
  console.log(`  管理端: http://localhost:${PORT}/admin`);
  if (!publicOrigin && process.env.RAILWAY_ENVIRONMENT) {
    console.log(`  ⚠ 未设置 PUBLIC_URL，线上媒体可能无法加载`);
  }
  console.log(`  默认账号: admin / admin123\n`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  端口 ${PORT} 已被占用，后端没有成功启动。`);
    console.error(`  请先执行: npm run restart`);
    console.error(`  或手动: lsof -ti:${PORT} | xargs kill -9\n`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
