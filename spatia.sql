CREATE DATABASE IF NOT EXISTS spatia;
USE spatia;

-- Stores the existing SPATIA interface's application state in MySQL.
-- The Java server uses PreparedStatement for all reads and writes.
CREATE TABLE IF NOT EXISTS app_data (
    data_key VARCHAR(100) PRIMARY KEY,
    data_value LONGTEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);
