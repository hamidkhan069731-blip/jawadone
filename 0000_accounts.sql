CREATE TABLE IF NOT EXISTS ll_users(id TEXT PRIMARY KEY NOT NULL,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,salt TEXT NOT NULL,password_hash TEXT NOT NULL,created INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS ll_sessions(token_hash TEXT PRIMARY KEY NOT NULL,user_id TEXT NOT NULL REFERENCES ll_users(id) ON DELETE CASCADE,expires INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS ll_attempts(attempt_key TEXT NOT NULL,stamp INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS ll_attempt_key ON ll_attempts(attempt_key,stamp);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS ll_session_expiry ON ll_sessions(expires);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS ll_reports(id TEXT PRIMARY KEY NOT NULL,user_id TEXT NOT NULL REFERENCES ll_users(id) ON DELETE CASCADE,title TEXT NOT NULL,payload TEXT NOT NULL,created INTEGER NOT NULL,updated INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS ll_report_owner ON ll_reports(user_id,updated);
