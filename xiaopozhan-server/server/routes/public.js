const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { uploadsDir, ensureUploadsDir } = require('../paths');
const { absolutizeUrl, absolutizeFileList } = require('../publicUrl');

const router = express.Router();

ensureUploadsDir();

function getSettings() {
  return db.prepare('SELECT * FROM system_settings WHERE id = 1').get();
}

function checkSensitive(content) {
  const words = db.prepare('SELECT word FROM sensitive_words').all();
  for (const { word } of words) {
    if (content.includes(word)) return word;
  }
  return null;
}

function saveBase64Image(dataUrl) {
  if (!dataUrl || !dataUrl.startsWith('data:image')) return '';
  const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) return '';
  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 5 * 1024 * 1024) return '';
  const filename = `${Date.now()}-${uuidv4()}.${ext}`;
  fs.writeFileSync(path.join(uploadsDir, filename), buffer);
  return `/uploads/${filename}`;
}

router.post('/messages', (req, res) => {
  const settings = getSettings();
  if (!settings.enable_message) {
    return res.status(403).json({ error: '留言功能已关闭' });
  }

  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: '内容不能为空' });
  }
  if (content.length > 300) {
    return res.status(400).json({ error: '内容不能超过300字' });
  }

  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  const blacklisted = db.prepare('SELECT id FROM ip_blacklist WHERE ip = ?').get(ip);
  if (blacklisted) {
    return res.status(403).json({ error: '提交受限' });
  }

  const rateLimit = db.prepare('SELECT last_submit FROM message_rate_limit WHERE ip = ?').get(ip);
  if (rateLimit) {
    const last = new Date(rateLimit.last_submit).getTime();
    if (Date.now() - last < 60000) {
      return res.status(429).json({ error: '提交太频繁，请1分钟后再试' });
    }
  }

  const hitWord = checkSensitive(content.trim());
  const status = hitWord ? 'hidden' : 'approved';

  const result = db.prepare(`
    INSERT INTO messages (content, ip, user_agent, status, review_remark)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    content.trim(),
    ip,
    req.headers['user-agent'] || '',
    status,
    hitWord ? `命中敏感词: ${hitWord}` : null
  );

  db.prepare(`
    INSERT INTO message_rate_limit (ip, last_submit) VALUES (?, datetime('now','localtime'))
    ON CONFLICT(ip) DO UPDATE SET last_submit = datetime('now','localtime')
  `).run(ip);

  res.json({
    success: true,
    id: result.lastInsertRowid,
    message: hitWord ? '已收到，内容因敏感词未公开展示' : '已送出，去签筒抽一条看看吧'
  });
});

router.get('/messages/public', (req, res) => {
  const items = db.prepare(`
    SELECT id, content, image_url, created_at FROM messages
    WHERE status = 'approved'
    ORDER BY created_at DESC LIMIT 50
  `).all();
  res.json({ items });
});

router.get('/activity/current', (req, res) => {
  const settings = getSettings();
  if (!settings.enable_activity) {
    return res.json({ activity: null, stickers: [] });
  }

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const activity = db.prepare(`
    SELECT * FROM activities
    WHERE status = 'active'
      AND datetime(start_time) <= datetime(?)
      AND datetime(end_time) >= datetime(?)
    ORDER BY id DESC LIMIT 1
  `).get(now, now);

  if (activity && activity.config) {
    try { activity.config = JSON.parse(activity.config); } catch { activity.config = {}; }
  }

  res.json({ activity, stickers: [] });
});

router.post('/activity/:id/works', (req, res) => {
  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  if (!activity) return res.status(404).json({ error: '活动不存在' });

  let config = {};
  try { config = JSON.parse(activity.config || '{}'); } catch { /* ignore */ }

  const { text, sticker_data, draw_data, image_url, device_id } = req.body;
  const textLimit = config.textLimit || 30;

  if (text && text.length > textLimit) {
    return res.status(400).json({ error: `文字不能超过${textLimit}字` });
  }
  if (!config.allowEmptyText && (!text || !text.trim())) {
    return res.status(400).json({ error: '请输入文字' });
  }

  const ip = req.ip || 'unknown';
  const maxSubmit = config.maxSubmitPerDevice || 1;

  if (device_id) {
    const count = db.prepare(
      'SELECT COUNT(*) as c FROM activity_works WHERE activity_id = ? AND device_id = ?'
    ).get(activity.id, device_id).c;
    if (count >= maxSubmit) {
      return res.status(429).json({ error: '每个设备只能参与一次' });
    }
  }

  const savedImageUrl = saveBase64Image(image_url) || image_url || '';

  const result = db.prepare(`
    INSERT INTO activity_works (activity_id, text, sticker_data, draw_data, image_url, ip, device_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    activity.id,
    text || '',
    JSON.stringify(sticker_data || []),
    JSON.stringify(draw_data || []),
    savedImageUrl,
    ip,
    device_id || ''
  );

  res.json({ success: true, id: result.lastInsertRowid, image_url: savedImageUrl });
});

function parseMediaJson(str) {
  if (!str) return [];
  try { return JSON.parse(str); } catch { return []; }
}

router.get('/moments', (req, res) => {
  const rows = db.prepare(`
    SELECT id, content, publish_time, media_json, sort, created_at
    FROM contents WHERE type = 'moment' AND status = 'published'
    ORDER BY sort DESC, publish_time DESC, id DESC
  `).all();
  const items = rows.map((row) => ({
    id: row.id,
    content: row.content || '',
    createTime: row.publish_time || row.created_at,
    fileList: absolutizeFileList(parseMediaJson(row.media_json))
  }));
  res.json({ items });
});

router.get('/music', (req, res) => {
  const items = db.prepare(`
    SELECT id, no, title, cover_url, media_url, duration, sort, shelf_slot,
      spine_material, spine_label, spine_color_left, spine_color_right, publish_time
    FROM contents WHERE type = 'music' AND status = 'published'
    ORDER BY CASE WHEN shelf_slot IS NULL THEN 1 ELSE 0 END, shelf_slot ASC, sort DESC, no ASC, id ASC
  `).all().map((row) => ({
    ...row,
    cover_url: absolutizeUrl(row.cover_url),
    media_url: absolutizeUrl(row.media_url)
  }));
  res.json({ items });
});

router.get('/music/:no', (req, res) => {
  const item = db.prepare(`
    SELECT * FROM contents
    WHERE type = 'music' AND status = 'published' AND no = ?
  `).get(req.params.no);
  if (!item) return res.status(404).json({ error: '音乐不存在' });
  res.json({
    ...item,
    cover_url: absolutizeUrl(item.cover_url),
    media_url: absolutizeUrl(item.media_url)
  });
});

router.get('/video', (req, res) => {
  const items = db.prepare(`
    SELECT id, no, title, cover_url, media_url, sort, shelf_slot,
      spine_material, spine_label, spine_color_left, spine_color_right, publish_time
    FROM contents WHERE type = 'video' AND status = 'published'
    ORDER BY CASE WHEN shelf_slot IS NULL THEN 1 ELSE 0 END, shelf_slot ASC, sort DESC, no ASC, id ASC
  `).all().map((row) => ({
    ...row,
    cover_url: absolutizeUrl(row.cover_url),
    media_url: absolutizeUrl(row.media_url)
  }));
  res.json({ items });
});

router.get('/video/:no', (req, res) => {
  const item = db.prepare(`
    SELECT * FROM contents
    WHERE type = 'video' AND status = 'published' AND no = ?
  `).get(req.params.no);
  if (!item) return res.status(404).json({ error: '视频不存在' });
  res.json({
    ...item,
    cover_url: absolutizeUrl(item.cover_url),
    media_url: absolutizeUrl(item.media_url)
  });
});

router.get('/settings/public', (req, res) => {
  const settings = getSettings();
  res.json({
    site_title: settings.site_title,
    enable_message: settings.enable_message,
    enable_activity: settings.enable_activity
  });
});

const { drawThreeSpread } = require('../tarotDeck');

router.post('/tarot/draw', (req, res) => {
  const { question } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({ error: '请输入你的问题' });
  }
  if (question.trim().length > 200) {
    return res.status(400).json({ error: '问题不能超过200字' });
  }

  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const blacklisted = db.prepare('SELECT id FROM ip_blacklist WHERE ip = ?').get(ip);
  if (blacklisted) {
    return res.status(403).json({ error: '提交受限' });
  }

  const rateLimit = db.prepare('SELECT last_submit FROM tarot_rate_limit WHERE ip = ?').get(ip);
  if (rateLimit) {
    const last = new Date(rateLimit.last_submit).getTime();
    if (Date.now() - last < 30000) {
      return res.status(429).json({ error: '请30秒后再试' });
    }
  }

  const cards = drawThreeSpread();
  const result = db.prepare(`
    INSERT INTO tarot_readings (question, cards_json, ip, user_agent)
    VALUES (?, ?, ?, ?)
  `).run(
    question.trim(),
    JSON.stringify(cards),
    ip,
    req.headers['user-agent'] || ''
  );

  db.prepare(`
    INSERT INTO tarot_rate_limit (ip, last_submit) VALUES (?, datetime('now','localtime'))
    ON CONFLICT(ip) DO UPDATE SET last_submit = datetime('now','localtime')
  `).run(ip);

  res.json({
    success: true,
    id: result.lastInsertRowid,
    question: question.trim(),
    cards,
  });
});

module.exports = router;
