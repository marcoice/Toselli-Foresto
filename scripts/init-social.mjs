import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://toselli-foresto-maarcotoselli.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzMwNDM4MDYsImlkIjoiZWY1NTQ5MDQtM2ViNS00ZWY4LTliYWQtZWU1Njk3YjVhNmI3IiwicmlkIjoiYTQzZGRkZTktOTA5Yy00ODM5LTkwYjctZjhiOWZlYzQ5Mzg0In0.04i5V8JnaNFfWQdRi2xbDwkxO7d3gnZ3FAmI1ghQBN8dR2Cgj12q738iXOKyu48naWTfuto-2N8naVhUfdBtDQ'
});

const tables = [
  `CREATE TABLE IF NOT EXISTS user_credentials (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS user_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, token TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS follows (id INTEGER PRIMARY KEY AUTOINCREMENT, follower_id INTEGER NOT NULL, following_id INTEGER NOT NULL, created_at TEXT DEFAULT (datetime('now')), UNIQUE(follower_id, following_id))`,
  `CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, content TEXT NOT NULL, image_url TEXT, post_type TEXT DEFAULT 'text', tags TEXT DEFAULT '[]', likes_count INTEGER DEFAULT 0, comments_count INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS post_likes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, post_id INTEGER NOT NULL, created_at TEXT DEFAULT (datetime('now')), UNIQUE(user_id, post_id))`,
  `CREATE TABLE IF NOT EXISTS post_comments (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, post_id INTEGER NOT NULL, content TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, actor_id INTEGER, type TEXT NOT NULL, title TEXT NOT NULL, body TEXT, link TEXT, is_read INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS saved_jobs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, job_id INTEGER NOT NULL, created_at TEXT DEFAULT (datetime('now')), UNIQUE(user_id, job_id))`,
  `CREATE TABLE IF NOT EXISTS saved_courses (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, course_id INTEGER NOT NULL, created_at TEXT DEFAULT (datetime('now')), UNIQUE(user_id, course_id))`,
  `CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, sender_id INTEGER NOT NULL, receiver_id INTEGER NOT NULL, content TEXT NOT NULL, is_read INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))`,
];

for (const sql of tables) {
  await client.execute(sql);
  console.log('OK:', sql.substring(13, 60));
}

const cnt = await client.execute('SELECT COUNT(*) as cnt FROM notifications WHERE user_id = 1');
if (Number(cnt.rows[0].cnt) === 0) {
  await client.execute("INSERT INTO notifications (user_id, type, title, body, link, is_read) VALUES (1, 'system', 'Benvenuto su DevHub IT! 🎉', 'Inizia esplorando i corsi e le opportunità di lavoro.', '/learn', 0)");
  await client.execute("INSERT INTO notifications (user_id, type, title, body, link, is_read) VALUES (1, 'badge', 'Completa il tuo primo quiz! 🏅', 'Supera un quiz per ottenere il tuo primo badge.', '/learn', 0)");
  await client.execute("INSERT INTO notifications (user_id, type, title, body, link, is_read) VALUES (1, 'job', 'Nuove posizioni disponibili 💼', 'Controlla le ultime opportunità di lavoro nel settore IT.', '/jobs', 0)");
  console.log('Seeded notifications');
}
console.log('DONE');
