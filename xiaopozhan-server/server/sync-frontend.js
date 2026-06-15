/**
 * 将小破站前台 src/assets 中的默认内容同步到数据库与 uploads
 * 用法: node server/sync-frontend.js
 * 可选: node server/sync-frontend.js --force  覆盖同 type+no 的已有内容
 */
const fs = require('fs');
const path = require('path');
const dbModule = require('./db');
const db = dbModule;
const { ensureAssetsTable } = dbModule;
const { uploadsDir, ensureUploadsDir } = require('./paths');

const force = process.argv.includes('--force') || process.env.SYNC_FORCE === '1';

function resolveAssetsDir() {
  const candidates = [
    path.resolve(__dirname, '../seed-assets'),
    path.resolve(__dirname, '../../xiaopozhan-dev/src/assets'),
  ];

  if (process.env.ASSETS_DIR) {
    candidates.unshift(process.env.ASSETS_DIR);
    console.warn('  检测到 ASSETS_DIR 环境变量，若同步失败请删除该变量');
  }

  for (const dir of candidates) {
    const probe = path.join(dir, 'music/mp3/intro.mp3');
    if (fs.existsSync(probe)) {
      try {
        const mp3Count = fs.readdirSync(path.join(dir, 'music/mp3')).length;
        console.log(`  ✓ 使用资源目录: ${dir}（mp3 ${mp3Count} 个）`);
      } catch {
        console.log(`  ✓ 使用资源目录: ${dir}`);
      }
      return dir;
    }
  }

  console.error('  ✗ 未找到有效资源目录！');
  console.error('    请删除 Railway 中的 ASSETS_DIR 变量');
  console.error('    并确认 /app/seed-assets/music/mp3/intro.mp3 存在');
  for (const dir of candidates) {
    console.error(`    - ${dir} ${fs.existsSync(dir) ? '(目录存在但无 intro.mp3)' : '(不存在)'}`);
  }
  return candidates[0];
}

const ASSETS = resolveAssetsDir();

function ensureAssetsTableSafe() {
  try {
    ensureAssetsTable();
  } catch (e) {
    console.error('ensureAssetsTable failed:', e.message);
  }
}
ensureAssetsTableSafe();
const UPLOAD_SUBDIR = 'frontend-sync';
const uploadsRoot = path.join(uploadsDir, UPLOAD_SUBDIR);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyAsset(relPath) {
  const src = path.join(ASSETS, relPath);
  if (!fs.existsSync(src)) {
    console.warn(`  ⚠ 文件不存在，跳过: ${relPath}`);
    return null;
  }
  ensureDir(uploadsRoot);
  const basename = path.basename(src);
  const dest = path.join(uploadsRoot, basename);
  fs.copyFileSync(src, dest);
  return `/uploads/${UPLOAD_SUBDIR}/${basename}`;
}

function uploadUrlToPath(url) {
  if (!url) return null;
  const rel = String(url).replace(/^\/uploads\//, '');
  if (!rel || rel === String(url)) return null;
  return path.join(uploadsDir, rel);
}

/** 数据库有 URL 但 Volume 上文件丢失时，仍需重新复制 */
function uploadUrlExists(url) {
  const filePath = uploadUrlToPath(url);
  return filePath && fs.existsSync(filePath);
}

function urlNeedsRepair(url) {
  return !url || !String(url).trim() || !uploadUrlExists(url);
}

function parseMediaList(str) {
  if (!str) return [];
  try {
    const list = JSON.parse(str);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function isMediaJsonBroken(str) {
  const list = parseMediaList(str);
  if (!list.length) return true;
  return list.some((f) => urlNeedsRepair(f.fileUrl));
}

function momentMediaJson(content) {
  if (content === '嘿嘿') {
    const videoUrl = copyAsset('liberty/moment_video/sp1.mp4');
    const videoCover = copyAsset('liberty/moment_video/sp_cover1.png');
    return videoUrl
      ? JSON.stringify([{ fileUrl: videoUrl, fileType: 'video', coverUrl: videoCover }])
      : '[]';
  }
  if (content === '咩') {
    const imageUrl = copyAsset('liberty/moment_image/202411.png');
    return imageUrl
      ? JSON.stringify([{ fileUrl: imageUrl, fileType: 'image' }])
      : '[]';
  }
  return '[]';
}

function upsertContent(type, no, data) {
  const existing = no != null
    ? db.prepare('SELECT id FROM contents WHERE type = ? AND no = ?').get(type, no)
    : null;

  if (existing && !force) {
    console.log(`  · 已存在 ${type} no=${no ?? '-'}，跳过`);
    return existing.id;
  }

  if (existing && force) {
    db.prepare(`
      UPDATE contents SET title=?, content=?, cover_url=?, media_url=?, media_json=?,
        status=?, sort=?, publish_time=?, updated_at=datetime('now','localtime')
      WHERE id=?
    `).run(
      data.title, data.content, data.cover_url, data.media_url, data.media_json,
      data.status, data.sort, data.publish_time, existing.id
    );
    console.log(`  ✓ 更新 ${type} no=${no ?? '-'} (id=${existing.id})`);
    return existing.id;
  }

  const result = db.prepare(`
    INSERT INTO contents (type, no, title, content, cover_url, media_url, media_json, status, sort, publish_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    type, no, data.title, data.content, data.cover_url, data.media_url, data.media_json,
    data.status, data.sort, data.publish_time
  );
  console.log(`  ✓ 新增 ${type} no=${no ?? '-'} (id=${result.lastInsertRowid})`);
  return result.lastInsertRowid;
}

function syncMoments() {
  console.log('\n【瞬间 /liberty】');

  const moments = [
    { content: '嘿嘿', publish_time: '2025-08-09 17:36:05', sort: 30 },
    { content: '咩', publish_time: '2025-08-09 17:36:05', sort: 20 },
    { content: '瞬间页DIV', publish_time: '2025-08-09 17:36:05', sort: 10 }
  ];

  const count = db.prepare("SELECT COUNT(*) as c FROM contents WHERE type='moment'").get().c;
  if (count > 0 && !force) {
    const rows = db.prepare(
      "SELECT id, content, media_json FROM contents WHERE type='moment'"
    ).all();
    let repaired = 0;
    for (const m of moments) {
      const row = rows.find((r) => r.content === m.content);
      if (!row) continue;
      if (!isMediaJsonBroken(row.media_json)) continue;
      const media_json = momentMediaJson(m.content);
      if (media_json === '[]') continue;
      db.prepare(`
        UPDATE contents SET media_json=?, updated_at=datetime('now','localtime') WHERE id=?
      `).run(media_json, row.id);
      console.log(`  ✓ 补全瞬间: ${m.content}`);
      repaired++;
    }
    console.log(repaired ? `  已补全 ${repaired} 条瞬间` : '  瞬间数据完整，跳过');
    return;
  }
  if (force) {
    db.prepare("DELETE FROM contents WHERE type='moment'").run();
  }

  for (const m of moments) {
    const media_json = momentMediaJson(m.content);
    db.prepare(`
      INSERT INTO contents (type, title, content, media_json, status, sort, publish_time)
      VALUES ('moment', ?, ?, ?, 'published', ?, ?)
    `).run(m.content, m.content, media_json, m.sort, m.publish_time);
    console.log(`  ✓ 瞬间: ${m.content}`);
  }
}

function syncMusic() {
  console.log('\n【音乐 /music】');
  const tracks = [
    { no: 1, title: 'intro', mp3: 'music/mp3/intro.mp3', cover: 'music/cover/intro_cover.png' },
    { no: 2, title: '月记/7', mp3: 'music/mp3/gei.mp3', cover: 'music/cover/gei.png' },
    { no: 3, title: '月记/8', mp3: 'music/mp3/nimen.mp3', cover: 'music/cover/nimen.png' },
    { no: 4, title: '月记/9', mp3: 'music/mp3/ting.mp3', cover: 'music/cover/ting.png' },
    { no: 5, title: '月记/10', mp3: 'music/mp3/TTing.mp3', cover: 'music/cover/TTing.png' },
    { no: 6, title: '月记/11', mp3: 'music/mp3/202411.mp3', cover: 'music/cover/202411.png' },
    { no: 7, title: '月记/12', mp3: 'music/mp3/202412.mp3', cover: 'music/cover/202412.png' },
    { no: 8, title: '月记/1', mp3: 'music/mp3/202501.mp3', cover: 'music/cover/202501.png' },
    { no: 9, title: '月记/2', mp3: 'music/mp3/202502.wav', cover: 'music/cover/202502.png' },
    { no: 10, title: '月记/3', mp3: 'music/mp3/202503.mp3', cover: 'music/cover/202503.png' },
    { no: 11, title: '月记/4', mp3: 'music/mp3/202504.mp3', cover: 'music/cover/202504.png' }
  ];

  const count = db.prepare("SELECT COUNT(*) as c FROM contents WHERE type='music'").get().c;
  if (count > 0 && !force) {
    let repaired = 0;
    for (const t of tracks) {
      const row = db.prepare(
        'SELECT id, media_url, cover_url FROM contents WHERE type = ? AND no = ?'
      ).get('music', t.no);
      if (!row) {
        const media_url = copyAsset(t.mp3);
        const cover_url = copyAsset(t.cover);
        upsertContent('music', t.no, {
          title: t.title,
          content: null,
          cover_url,
          media_url,
          media_json: null,
          status: 'published',
          sort: 100 - t.no,
          publish_time: '2025-08-09 12:00:00'
        });
        repaired++;
        continue;
      }
      const needMedia = urlNeedsRepair(row.media_url);
      const needCover = urlNeedsRepair(row.cover_url);
      if (!needMedia && !needCover) continue;
      const media_url = needMedia ? copyAsset(t.mp3) : row.media_url;
      const cover_url = needCover ? copyAsset(t.cover) : row.cover_url;
      if (media_url || cover_url) {
        db.prepare(`
          UPDATE contents SET media_url=?, cover_url=?, updated_at=datetime('now','localtime')
          WHERE id=?
        `).run(media_url || row.media_url, cover_url || row.cover_url, row.id);
        console.log(`  ✓ 补全 music no=${t.no}`);
        repaired++;
      }
    }
    console.log(repaired ? `  已补全 ${repaired} 条音乐` : '  音乐数据完整，跳过');
    return;
  }
  if (force) {
    db.prepare("DELETE FROM contents WHERE type='music'").run();
  }

  for (const t of tracks) {
    const media_url = copyAsset(t.mp3);
    const cover_url = copyAsset(t.cover);
    upsertContent('music', t.no, {
      title: t.title,
      content: null,
      cover_url,
      media_url,
      media_json: null,
      status: 'published',
      sort: 100 - t.no,
      publish_time: '2025-08-09 12:00:00'
    });
  }
}

function syncVideo() {
  console.log('\n【视频 /music 视频区】');
  const count = db.prepare("SELECT COUNT(*) as c FROM contents WHERE type='video'").get().c;
  if (count > 0 && !force) {
    const row = db.prepare(
      'SELECT id, media_url, cover_url FROM contents WHERE type = ? AND no = 1'
    ).get('video');
    if (row && (urlNeedsRepair(row.media_url) || urlNeedsRepair(row.cover_url))) {
      const media_url = uploadUrlExists(row.media_url)
        ? row.media_url
        : copyAsset('liberty/moment_video/sp1.mp4');
      const cover_url = uploadUrlExists(row.cover_url)
        ? row.cover_url
        : copyAsset('music/mp4/cover/v0531.png');
      db.prepare(`
        UPDATE contents SET media_url=?, cover_url=?, updated_at=datetime('now','localtime') WHERE id=?
      `).run(media_url, cover_url, row.id);
      console.log('  ✓ 补全视频 no=1');
    } else {
      console.log('  视频数据完整，跳过');
    }
    return;
  }
  if (force) {
    db.prepare("DELETE FROM contents WHERE type='video'").run();
  }

  const media_url = copyAsset('liberty/moment_video/sp1.mp4');
  const cover_url = copyAsset('music/mp4/cover/v0531.png');
  upsertContent('video', 1, {
    title: '2025/05/31',
    content: null,
    cover_url,
    media_url,
    media_json: null,
    status: 'published',
    sort: 10,
    publish_time: '2025-05-31 12:00:00'
  });
}

function syncCommentWallMessages() {
  console.log('\n【留言墙示例】');
  const samples = [
    {
      content: 'xixixix',
      image: 'comment_wall/comment_image/xx2.png',
      created_at: '2025-08-01 20:47:52'
    },
    {
      content: '哈哈哈嘿嘿',
      image: null,
      created_at: '2025-08-02 20:47:52'
    }
  ];

  for (const s of samples) {
    const exists = db.prepare('SELECT id FROM messages WHERE content = ?').get(s.content);
    if (exists && !force) {
      console.log(`  · 留言已存在: ${s.content}`);
      continue;
    }
    const image_url = s.image ? copyAsset(s.image) : null;
    if (exists && force) {
      db.prepare('UPDATE messages SET image_url=?, status=?, created_at=? WHERE id=?')
        .run(image_url, 'approved', s.created_at, exists.id);
      console.log(`  ✓ 更新留言: ${s.content}`);
    } else {
      db.prepare(`
        INSERT INTO messages (content, image_url, status, ip, created_at)
        VALUES (?, ?, 'approved', '127.0.0.1', ?)
      `).run(s.content, image_url, s.created_at);
      console.log(`  ✓ 新增留言: ${s.content}`);
    }
  }
}

console.log('正在同步前台默认数据到后台...');
console.log(`资源目录: ${ASSETS}`);
if (!fs.existsSync(path.join(ASSETS, 'music/mp3/intro.mp3'))) {
  console.error('⚠ 资源目录无效，无法复制 mp3/图片');
  console.error('  → 确认构建日志有 seed-assets OK');
} else {
  console.log('✓ intro.mp3 可读');
}
ensureUploadsDir();
ensureDir(uploadsRoot);
console.log(`上传目录: ${uploadsDir}`);

try {
  syncMoments();
  syncMusic();
  syncVideo();
  syncCommentWallMessages();
} catch (e) {
  console.error('同步过程出错（服务仍会启动）:', e);
}

console.log('\n同步完成！');
console.log('前台刷新 /liberty、/music、/commentWall 即可看到数据。');
console.log('后台管理: http://localhost:3002/admin');
