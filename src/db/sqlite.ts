import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DEFAULT_LOCAL_PATH = path.resolve(process.cwd(), 'data', 'kvitter.db');
// On Azure App Service Linux, use persistent storage under /home
const DEFAULT_AZURE_PATH = '/home/site/data/kvitter.db';

function resolveDbPath(): string {
  if (process.env.DB_PATH) return process.env.DB_PATH;
  // Detect Azure App Service via WEBSITE_SITE_NAME env var
  if (process.env.WEBSITE_SITE_NAME) return DEFAULT_AZURE_PATH;
  return DEFAULT_LOCAL_PATH;
}

const dbPath = resolveDbPath();
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const db = new Database(dbPath);

// Pragmas for simple durability & performance trade-offs
try {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
} catch (e) {
  // ignore
}

// Schema migration (idempotent)
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  handle TEXT NOT NULL UNIQUE,
  displayName TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tweets (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  body TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tweets_user_created ON tweets(userId, createdAt DESC);
`);

export function isHealthy(): boolean {
  try {
    db.prepare('select 1').get();
    return true;
  } catch {
    return false;
  }
}
