-- 우리 아기 기록 D1 schema (same statements famEnsure() runs idempotently on the first API call).
-- Family codes are never stored: family_id = SHA-256(family code).
CREATE TABLE IF NOT EXISTS families (id TEXT PRIMARY KEY, seq INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS entries (family_id TEXT NOT NULL, id TEXT NOT NULL, data TEXT, deleted INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL, seq INTEGER NOT NULL, PRIMARY KEY (family_id, id));
CREATE INDEX IF NOT EXISTS entries_seq ON entries (family_id, seq);
CREATE TABLE IF NOT EXISTS members (family_id TEXT NOT NULL, dev TEXT NOT NULL, nick TEXT, last_seen INTEGER NOT NULL, PRIMARY KEY (family_id, dev));
CREATE TABLE IF NOT EXISTS handoffs (id TEXT PRIMARY KEY, family_id TEXT NOT NULL, box TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS profiles (family_id TEXT PRIMARY KEY, birth TEXT, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS milestone_marks (family_id TEXT NOT NULL, id TEXT NOT NULL, achieved_at TEXT, updated_at INTEGER NOT NULL, deleted INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (family_id, id));
CREATE INDEX IF NOT EXISTS milestone_marks_fam ON milestone_marks (family_id);
CREATE TABLE IF NOT EXISTS custom_milestones (family_id TEXT NOT NULL, id TEXT NOT NULL, text TEXT NOT NULL, event_at TEXT, achieved INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL, deleted INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (family_id, id));
CREATE INDEX IF NOT EXISTS custom_milestones_fam ON custom_milestones (family_id);
CREATE TABLE IF NOT EXISTS photos (family_id TEXT NOT NULL, id TEXT NOT NULL, key TEXT, date TEXT, note TEXT, by TEXT, dev TEXT, size INTEGER NOT NULL DEFAULT 0, deleted INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY (family_id, id));
CREATE INDEX IF NOT EXISTS photos_fam ON photos (family_id);
CREATE TABLE IF NOT EXISTS photo_blobs (key TEXT PRIMARY KEY, data BLOB NOT NULL);
CREATE TABLE IF NOT EXISTS push_subs (family_id TEXT NOT NULL, dev TEXT NOT NULL, endpoint TEXT NOT NULL, p256dh TEXT NOT NULL, auth TEXT NOT NULL, records INTEGER NOT NULL DEFAULT 1, photos INTEGER NOT NULL DEFAULT 1, lang TEXT NOT NULL DEFAULT 'ko', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY (family_id, dev));
CREATE INDEX IF NOT EXISTS push_subs_fam ON push_subs (family_id);
CREATE TABLE IF NOT EXISTS push_throttle (family_id TEXT NOT NULL, kind TEXT NOT NULL, last_sent INTEGER NOT NULL, PRIMARY KEY (family_id, kind));
CREATE TABLE IF NOT EXISTS view_codes (id TEXT PRIMARY KEY, family_id TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS view_codes_fam ON view_codes (family_id);
CREATE TABLE IF NOT EXISTS view_members (family_id TEXT NOT NULL, dev TEXT NOT NULL, PRIMARY KEY (family_id, dev));
