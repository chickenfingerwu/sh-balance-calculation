CREATE DATABASE salary_hero;

CREATE TABLE IF NOT EXISTS worker (
    id UUID PRIMARY KEY,
    first_name VARCHAR (50),
    last_name VARCHAR (50),
    age INT,
    compensation FLOAT,
    type VARCHAR (50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS balance (
    id SERIAL PRIMARY KEY,
    worker_id UUID UNIQUE,
    balance FLOAT,
    days_worked INT,
    latest_balance_updated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_worker
        FOREIGN KEY (worker_id)
            REFERENCES worker(id)
);

CREATE INDEX IF NOT EXISTS worker_id_idx ON balance (worker_id);
