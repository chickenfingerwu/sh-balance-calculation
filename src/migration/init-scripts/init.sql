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

do
$do$
    declare
        i int;
    begin
        for i in 1..10 loop
                INSERT INTO worker(id, first_name, last_name, age, compensation, type)
                VALUES (uuid_in(overlay(overlay(md5(random()::text || ':' || random()::text) placing '4' from 13) placing to_hex(floor(random()*(11-8+1) + 8)::int)::text from 17)::cstring), 'test', 'test', 23, floor(random() * (90000-10000+1) + 10000), 'monthly');
            end loop;
    end
$do$;

INSERT INTO balance(worker_id)
SELECT id FROM worker;