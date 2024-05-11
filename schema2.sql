DROP TABLE IF EXISTS builds_new;
CREATE TABLE builds_new (
    channel TEXT NOT NULL,
    build_number INTEGER NOT NULL,
    version_hash TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    rollback INTEGER NOT NULL,
    PRIMARY KEY (channel, timestamp, build_number, version_hash)
);

INSERT INTO builds_new SELECT * FROM builds;

DROP TABLE builds;
ALTER TABLE builds_new RENAME TO builds;

CREATE INDEX IF NOT EXISTS idx_channel_rollback ON builds (channel, rollback);
