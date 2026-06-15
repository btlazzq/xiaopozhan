const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { uploadsDir, ensureUploadsDir } = require('../paths');
const { SPINE_MATERIAL_LIST } = require('../spineMaterials');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

ensureUploadsDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

router.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '未上传文件' });
  const type = req.body.type || 'file';
  const url = `/uploads/${req.file.filename}`;
  const result = db.prepare(`
    INSERT INTO assets (type, filename, url, size, mime_type, category)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    type,
    req.file.originalname,
    url,
    req.file.size,
    req.file.mimetype,
    req.body.category || ''
  );
  res.json({
    id: result.lastInsertRowid,
    url,
    filename: req.file.originalname,
    size: req.file.size
  });
});

router.get('/spine-materials', authMiddleware, (req, res) => {
  const kind = req.query.kind;
  let items = SPINE_MATERIAL_LIST;
  if (kind === 'vhs') items = items.filter((m) => m.category === 'vhs');
  else if (kind === 'tape') items = items.filter((m) => !m.category || m.category === 'tape');
  res.json({ items });
});

router.get('/contents', authMiddleware, (req, res) => {
  const { type, status } = req.query;
  let sql = 'SELECT * FROM contents WHERE 1=1';
  const params = [];
  if (type) { sql += ' AND type = ?'; params.push(type); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  sql += ' ORDER BY sort DESC, id DESC';
  res.json({ items: db.prepare(sql).all(...params) });
});

router.post('/contents', authMiddleware, (req, res) => {
  const d = req.body;
  const mediaJson = d.media_json
    ? (typeof d.media_json === 'string' ? d.media_json : JSON.stringify(d.media_json))
    : null;
  const result = db.prepare(`
    INSERT INTO contents (type, no, title, content, cover_url, media_url, media_json, duration, status, sort, shelf_slot, spine_material, spine_label, spine_color_left, spine_color_right, publish_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    d.type,
    d.no || null,
    d.title || null,
    d.content || null,
    d.cover_url || null,
    d.media_url || null,
    mediaJson,
    d.duration || 0,
    d.status || 'draft',
    d.sort || 0,
    d.shelf_slot ?? null,
    d.spine_material || null,
    d.spine_label || null,
    d.spine_color_left || null,
    d.spine_color_right || null,
    d.publish_time || null
  );
  res.json({ id: result.lastInsertRowid });
});

router.put('/contents/:id', authMiddleware, (req, res) => {
  const d = req.body;
  const mediaJson = d.media_json !== undefined
    ? (typeof d.media_json === 'string' ? d.media_json : JSON.stringify(d.media_json))
    : null;
  db.prepare(`
    UPDATE contents SET
      type=?, no=?, title=?, content=?, cover_url=?, media_url=?, media_json=?,
      duration=?, status=?, sort=?, shelf_slot=?, spine_material=?, spine_label=?,
      spine_color_left=?, spine_color_right=?, publish_time=?,
      updated_at=datetime('now','localtime')
    WHERE id=?
  `).run(
    d.type,
    d.no,
    d.title,
    d.content,
    d.cover_url,
    d.media_url,
    mediaJson,
    d.duration || 0,
    d.status,
    d.sort || 0,
    d.shelf_slot ?? null,
    d.spine_material || null,
    d.spine_label || null,
    d.spine_color_left || null,
    d.spine_color_right || null,
    d.publish_time,
    req.params.id
  );
  res.json({ success: true });
});

router.delete('/contents/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM contents WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.get('/messages', authMiddleware, (req, res) => {
  const { status, keyword } = req.query;
  let sql = 'SELECT * FROM messages WHERE 1=1';
  const params = [];
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  } else {
    sql += " AND status != 'deleted'";
  }
  if (keyword) { sql += ' AND content LIKE ?'; params.push(`%${keyword}%`); }
  sql += ' ORDER BY created_at DESC';
  res.json({ items: db.prepare(sql).all(...params) });
});

router.put('/messages/:id', authMiddleware, (req, res) => {
  const { status, review_remark } = req.body;
  db.prepare(`
    UPDATE messages SET status=?, review_remark=?, reviewed_at=datetime('now','localtime') WHERE id=?
  `).run(status, review_remark || '', req.params.id);
  res.json({ success: true });
});

router.post('/messages/batch', authMiddleware, (req, res) => {
  const { ids, status } = req.body;
  const stmt = db.prepare('UPDATE messages SET status=?, reviewed_at=datetime(\'now\',\'localtime\') WHERE id=?');
  const batch = db.transaction((ids) => {
    for (const id of ids) stmt.run(status, id);
  });
  batch(ids);
  res.json({ success: true });
});

router.get('/dashboard', authMiddleware, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const publicMessages = db.prepare("SELECT COUNT(*) as c FROM messages WHERE status = 'approved'").get().c;
  const hiddenMessages = db.prepare("SELECT COUNT(*) as c FROM messages WHERE status = 'hidden'").get().c;
  const activityWorks = db.prepare('SELECT COUNT(*) as c FROM activity_works').get().c;
  const todayMessages = db.prepare("SELECT COUNT(*) as c FROM messages WHERE date(created_at) = ?").get(today).c;
  const momentCount = db.prepare("SELECT COUNT(*) as c FROM contents WHERE type='moment' AND status='published'").get().c;
  const musicCount = db.prepare("SELECT COUNT(*) as c FROM contents WHERE type='music' AND status='published'").get().c;
  const videoCount = db.prepare("SELECT COUNT(*) as c FROM contents WHERE type='video' AND status='published'").get().c;
  const recentMessages = db.prepare(
    'SELECT id, content, status, ip, created_at FROM messages ORDER BY created_at DESC LIMIT 8'
  ).all();
  res.json({
    stats: {
      publicMessages,
      hiddenMessages,
      activityWorks,
      todayMessages,
      momentCount,
      musicCount,
      videoCount
    },
    recentMessages
  });
});

router.get('/settings', authMiddleware, (req, res) => {
  const settings = db.prepare('SELECT * FROM system_settings WHERE id = 1').get();
  res.json(settings);
});

router.put('/settings', authMiddleware, (req, res) => {
  const { site_title, enable_message, enable_activity } = req.body;
  db.prepare(`
    UPDATE system_settings SET
      site_title = COALESCE(?, site_title),
      enable_message = COALESCE(?, enable_message),
      enable_activity = COALESCE(?, enable_activity),
      updated_at = datetime('now','localtime')
    WHERE id = 1
  `).run(
    site_title ?? null,
    enable_message !== undefined ? (enable_message ? 1 : 0) : null,
    enable_activity !== undefined ? (enable_activity ? 1 : 0) : null
  );
  res.json({ success: true });
});

router.get('/activities', authMiddleware, (req, res) => {
  const items = db.prepare('SELECT * FROM activities ORDER BY id DESC').all();
  res.json({ items });
});

router.get('/activities/:id/works', authMiddleware, (req, res) => {
  const items = db.prepare(
    'SELECT * FROM activity_works WHERE activity_id = ? ORDER BY created_at DESC'
  ).all(req.params.id);
  res.json({ items });
});

router.get('/tarot', authMiddleware, (req, res) => {
  const keyword = (req.query.keyword || '').trim();
  let sql = 'SELECT * FROM tarot_readings WHERE 1=1';
  const params = [];
  if (keyword) {
    sql += ' AND (question LIKE ? OR cards_json LIKE ? OR ip LIKE ?)';
    const kw = `%${keyword}%`;
    params.push(kw, kw, kw);
  }
  sql += ' ORDER BY created_at DESC LIMIT 200';
  const items = db.prepare(sql).all(...params).map((row) => ({
    id: row.id,
    question: row.question,
    ip: row.ip,
    user_agent: row.user_agent,
    created_at: row.created_at,
    cards: JSON.parse(row.cards_json || '[]'),
  }));
  res.json({ items });
});

router.delete('/tarot/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM tarot_readings WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
