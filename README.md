# sh-balance-calculation
A program that calculate worker's withdrawal balance for Salary Hero

# Folder structure
- `src` contains all source code
- `business` contains the business logic
- `entity` contains schema model of domain entities
- `infra` setup overhead
- `migration` migration files
- `tests` test files

`src/index.ts` is the program main entry point

# Model schema

![schema.jpg](..%2F..%2FDownloads%2Fschema.jpg)

# High level design/idea

The program uses a cronjob that runs every day at midnight to update the `Balance` table.
This process has 2 steps:
1. Scan for data of worker (compensation, type of worker, days worked)
2. Do calculation base on worker data and update `Balance` table

![architecture.jpg](..%2F..%2FDownloads%2Farchitecture.jpg)

In order to efficiently do scan & update, we need an algorithm that is optimal and non-blocking:

Pre-requisites:
1. Index `worker_id` on `Worker` & `Balance` (as foreign key) table for efficient scan.

Steps:
1. Partition the `Balance` record by ID - this requires ID to be serial integer.
2. Create new thread per partition. 
3. On each thread, do calculation & update queries by batch of `COUNT_PER_BATCH` (default 500)

Benchmark:
- 100.000 records: 37.137s
- 1.000.000 records: TBD

# How I came up with solution
First, I noticed a bottleneck with the requirement - updates all balance every night.
This is a bottleneck because it means the database will do most of the heavy lifting - running loads of queries every night.
So if we don't take care of how to do efficient queries, at scale, this will become a problem - 
program takes too long to finish, affect all other operations on the database,...

Naturally, a way to speed up scanning is by indexing - here, we index `worker_id` on `Worker` and `Balance` table.
This helps to increase efficiency of retrieval data process.

Where it gets tricky is how to update efficiently, this requires some handling on application layer.
One idea I had is to separate the `Read` & `Write` process by applying CQRS design pattern.
Where each process will have their own database, and communicate via an event bus - Kafka, RabbitMQ.
But this requires a lot of infrastructure overhead, and in the interest of time, I decided to scrap the idea.

2nd idea I have is to utilize concurrency of NodeJS & partition. When handling heavy data,
it's always easier to break it down to small digestible chunks. Thus, it's important that we partition
the data that needs processing - `Balance` records - into partitions based on its ID. Here I use serial ID  for the `Balance` table, which makes it much easier to partition. 
After partitioning the data, we continue breaking data down into batches, this is so that in case of huge partition size, we won't overload the database.
In code, I set default batch size to 500 (just an arbitrary number, need further research to find optimal batch size)
which means Postgres will execute 500 queries in batches (per partition) at a time in order to do our calculation.

All of this needs to be executed inside transactions with row-level locking so as to prevent concurrent write that can happen during our update.

After benchmarking at 100.000 records, this process took ~37 seconds as opposed to [TBD] when updating sequentially.