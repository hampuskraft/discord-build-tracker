DROP TABLE IF EXISTS builds;
CREATE TABLE builds (
    channel TEXT NOT NULL,
    build_number INTEGER NOT NULL,
    version_hash TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    rollback INTEGER NOT NULL,
    PRIMARY KEY (channel, build_number, version_hash, timestamp)
);
