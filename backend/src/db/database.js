import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the DB path:  allow override via DB_PATH env variable, else
// default to  <project-root>/backend/data/appointments.db
const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, "../../data/appointments.db");

let _db = null;

/** Initialise the SQLite database (idempotent — safe to call many times). */
function initDb(db) {
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      phone       TEXT NOT NULL,
      date        TEXT NOT NULL,
      time        TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'pending',
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      updated_at  TEXT
    );

    CREATE TABLE IF NOT EXISTS migrations_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );
  `);
}

/**
 * Return the shared SQLite database instance.
 * The database is created and initialised on first call.
 *
 * @returns {import('better-sqlite3').Database}
 */
export function getDb() {
  if (!_db) {
    _db = new Database(dbPath);
    initDb(_db);
  }
  return _db;
}
