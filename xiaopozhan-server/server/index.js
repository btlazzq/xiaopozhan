const express = require('express');
const path = require('path');
const cors = require('cors');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3002;

app.set('trust proxy', true);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: '服务器错误' });
});

app.listen(PORT, () => {
  console.log(`\n  小破站 API 已启动`);
  console.log(`  API:  http://localhost:${PORT}/api`);
  console.log(`  管理端: http://localhost:${PORT}/admin`);
  console.log(`  默认账号: admin / admin123\n`);
});
