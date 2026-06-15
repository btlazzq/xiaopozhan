const Database = require('better-sqlite3');
const path = require('path');
const { dataDir, ensureDataDirs } = require('./paths');

ensureDataDirs();

const db = new Database(path.join(dataDir, 'site.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      image_url TEXT,
      ip TEXT,
      user_agent TEXT,
      status TEXT DEFAULT 'pending',
      review_remark TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      reviewed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      config TEXT,
      template_url TEXT,
      start_time TEXT,
      end_time TEXT,
      status TEXT DEFAULT 'draft',
      show_entry INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS activity_works (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id INTEGER NOT NULL,
      text TEXT,
      sticker_data TEXT,
      draw_data TEXT,
      image_url TEXT,
      ip TEXT,
      device_id TEXT,
      status TEXT DEFAULT 'approved',
      created_at TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (activity_id) REFERENCES activities(id)
    );

    CREATE TABLE IF NOT EXISTS sensitive_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS ip_blacklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT NOT NULL UNIQUE,
      reason TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'super_admin',
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      site_title TEXT DEFAULT '小破站',
      enable_message INTEGER DEFAULT 1,
      enable_activity INTEGER DEFAULT 1,
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS message_rate_limit (
      ip TEXT PRIMARY KEY,
      last_submit TEXT
    );

    CREATE TABLE IF NOT EXISTS contents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      no INTEGER,
      title TEXT,
      content TEXT,
      cover_url TEXT,
      media_url TEXT,
      media_json TEXT,
      duration INTEGER DEFAULT 0,
      status TEXT DEFAULT 'draft',
      sort INTEGER DEFAULT 0,
      publish_time TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS tarot_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      cards_json TEXT NOT NULL,
      ip TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS tarot_rate_limit (
      ip TEXT PRIMARY KEY,
      last_submit TEXT
    );

    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      filename TEXT,
      url TEXT,
      size INTEGER,
      mime_type TEXT,
      category TEXT,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
  `);

  const settings = db.prepare('SELECT id FROM system_settings WHERE id = 1').get();
  if (!settings) {
    db.prepare('INSERT INTO system_settings (id, site_title) VALUES (1, ?)').run('小破站');
  }

  const contentCols = db.prepare('PRAGMA table_info(contents)').all().map((c) => c.name);
  if (!contentCols.includes('shelf_slot')) {
    db.exec('ALTER TABLE contents ADD COLUMN shelf_slot INTEGER');
  }
  if (!contentCols.includes('spine_material')) {
    db.exec('ALTER TABLE contents ADD COLUMN spine_material TEXT');
  }
  if (!contentCols.includes('spine_label')) {
    db.exec('ALTER TABLE contents ADD COLUMN spine_label TEXT');
  }
  if (!contentCols.includes('spine_color_left')) {
    db.exec('ALTER TABLE contents ADD COLUMN spine_color_left TEXT');
  }
  if (!contentCols.includes('spine_color_right')) {
    db.exec('ALTER TABLE contents ADD COLUMN spine_color_right TEXT');
  }
}

initDb();

module.exports = db;
