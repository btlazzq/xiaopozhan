const bcrypt = require('bcryptjs');
const db = require('./db');

console.log('正在初始化种子数据...');

const existingAdmin = db.prepare('SELECT id FROM admin_users WHERE username = ?').get('admin');
if (!existingAdmin) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)').run(
    'admin', hash, 'super_admin'
  );
  console.log('✓ 管理员账号: admin / admin123');
}

const words = ['广告', '赌博', '色情'];
for (const word of words) {
  try {
    db.prepare('INSERT INTO sensitive_words (word) VALUES (?)').run(word);
  } catch { /* exists */ }
}

const activityCount = db.prepare('SELECT COUNT(*) as c FROM activities').get().c;
if (activityCount === 0) {
  const config = JSON.stringify({
    textLimit: 30,
    allowEmptyText: true,
    maxSubmitPerDevice: 3,
    enableSticker: true,
    enableDraw: true,
    exportType: 'png'
  });
  db.prepare(`
    INSERT INTO activities (name, type, config, start_time, end_time, status, show_entry)
    VALUES ('明信片活动', 'postcard', ?, '2026-01-01 00:00:00', '2027-12-31 23:59:59', 'active', 1)
  `).run(config);
  console.log('✓ 明信片活动已创建');
}

const msgCount = db.prepare('SELECT COUNT(*) as c FROM messages').get().c;
if (msgCount === 0) {
  const msgs = [
    '今天也要好好吃饭呀',
    '有点想你了',
    '说出来了就轻松了'
  ];
  for (const m of msgs) {
    db.prepare("INSERT INTO messages (content, status, ip) VALUES (?, 'approved', '127.0.0.1')").run(m);
  }
  console.log('✓ 示例留言已创建');
}

console.log('\n种子数据初始化完成！');
