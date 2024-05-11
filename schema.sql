CREATE TABLE builds (
    channel TEXT NOT NULL,
    build_number INTEGER NOT NULL,
    version_hash TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    rollback INTEGER NOT NULL,
    PRIMARY KEY (channel, timestamp, build_number, version_hash)
);

CREATE INDEX IF NOT EXISTS idx_channel_rollback ON builds (channel, rollback);
