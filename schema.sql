CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nickname    TEXT NOT NULL COLLATE NOCASE UNIQUE,
  pass_hash   TEXT NOT NULL,
  plan        TEXT NOT NULL DEFAULT 'free',
  plan_until  TEXT,
  device_id   TEXT,
  created_at  TEXT NOT NULL,
  last_login  TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash  TEXT PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL,
  expires_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS rate (
  ip        TEXT PRIMARY KEY,
  n         INTEGER NOT NULL,
  reset_at  INTEGER NOT NULL
);

/*
 * Ранг пользователя (миграция — ALTER TABLE users ADD COLUMN rank TEXT
 * NOT NULL DEFAULT 'player';). Уровни: owner 7, developer 6, manager 5,
 * deputy_manager 4, admin 3, junior_admin 2, player 0.
 */

CREATE TABLE IF NOT EXISTS forum_topics (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  author_nick TEXT NOT NULL,
  author_rank TEXT NOT NULL DEFAULT 'player',
  title       TEXT NOT NULL,
  tag         TEXT NOT NULL,
  body        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',
  reason      TEXT,
  views       INTEGER NOT NULL DEFAULT 0,
  replies     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS forum_messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id   INTEGER NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  author_id  INTEGER,
  author_nick TEXT NOT NULL,
  author_rank TEXT NOT NULL DEFAULT 'player',
  body       TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS forum_topics_tag_status ON forum_topics(tag, status);
CREATE INDEX IF NOT EXISTS forum_topics_updated ON forum_topics(updated_at DESC);
CREATE INDEX IF NOT EXISTS forum_messages_topic ON forum_messages(topic_id, id);
