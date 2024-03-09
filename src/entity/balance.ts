import "reflect-metadata";
import {Entity, PrimaryGeneratedColumn, Column, Repository, DataSource, FindOneOptions} from "typeorm";
import { OneToOne } from "typeorm";
import { Worker } from "./worker";
import { JoinColumn } from "typeorm";

@Entity("balance")
export class Balance {
    @PrimaryGeneratedColumn("increment")
        id: number;

    @Column({name: "worker_id"})
        workerID: string;

    @OneToOne(() => Worker)
    @JoinColumn({name: "worker_id"})
        worker: Worker;

    @Column({type: "float"})
        balance: number;

    @Column({name: "latest_balance_updated_at"})
        latestBalanceUpdatedAt: Date;

    @Column({name: "days_worked"})
        daysWorked: number;
}

// have compensation data of worker
interface CompData {
    worker_id: string;
    compensation: number;
    days_worked: number;
    type: string;
}

export class BalanceRepo {
    private db: DataSource;
    repo: Repository<Balance>;

    constructor(db?: DataSource) {
        if (db) {
            this.db = db;
            this.repo = db.getRepository(Balance);
        }
    }

    async saveBalance(rec: Balance): Promise<Balance> {
        try {
            return this.repo.save(rec);
        } catch(err) {
            console.log("failed save balance: ", err);
            throw err;
        }
    }

    async getBalance(workerID: string): Promise<Balance | null> {
        try {
            return this.repo.findOne({
                where: {
                    workerID: workerID
                }
            } as FindOneOptions<Balance>);
        } catch(err) {
            console.log("failed save balance: ", err);
            throw err;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async wrapTransaction( func: () => Promise<any>): Promise<any> {
        const queryRunner = this.db.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await func();
            await queryRunner.commitTransaction();
        } catch(err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async partitionById(): Promise<number[][]> {
        const max = await this.repo.maximum("id") as number;
        const min = await this.repo.minimum("id") as number;
        return partitionByRange(min, max, 4);
    }

    // algorithm:
    // - separate balance records to 4 partitions by ID
    // - batch update each partition
    async calcBalanceTable(calcFunc: (data: {
        compensation: number
        daysWorked: number
        type: string
    }) => number) {
        const partitions = await this.partitionById();

        console.time("test 1000000");
        const promises: Promise<void>[] = partitions.map(async (part): Promise<void> => {
            try {
                await this.wrapTransaction(async () => {

                    // query compensation data
                    // set row-lock to prevent concurrent write
                    const data: CompData[] = await this.repo.query(`
                        SELECT b.days_worked, b.worker_id, w.compensation, w.type
                        FROM balance b
                        INNER JOIN worker w ON b.worker_id = w.id
                        WHERE b.id >= $1 AND b.id <= $2
                        FOR UPDATE
                    `, [part[0], part[1]]);

                    // tricky way to do batch upsert with Postgres:
                    // - loop through all records
                    // - create upsert query for each balance record
                    // - concat all queries to 1 big query and send to Postgres
                    let query = "";
                    for (let i = 0; i < data.length; i++){
                        const d = data[i];

                        // auto increment days worked by 1
                        const daysWorked = d.days_worked + 1;
                        const balance = calcFunc({
                            compensation: d.compensation,
                            daysWorked: daysWorked,
                            type: d.type
                        });

                        query += `INSERT INTO balance(worker_id, balance, days_worked, latest_balance_updated_at)
                                 VALUES('` + d.worker_id + "', " + balance + ", " + daysWorked + `, NOW())
                                 ON CONFLICT (worker_id)
                                 DO UPDATE SET balance = ` + balance + ", days_worked = " + daysWorked + ", latest_balance_updated_at = NOW();";

                        // upsert by batch of 500 queries
                        if (i % 500 == 0 || i == data.length - 1) {
                            await this.repo.query(query);
                        }
                    }
                });
            } catch(err) {
                console.log("failed update: ", err);
                throw err;
            }
        });
        await Promise.allSettled(promises);
        console.timeEnd("test 1000000");
    }
}

export const partitionByRange = (min: number, max: number, partitionsCount: number): number[][] => {
    const partitions: number[][] = [];
    const step = Math.floor((max - min)/partitionsCount);
    let startId = min;
    let endId = min + step;
    while (endId <= max) {
        partitions.push([startId, Math.min(max, endId)]);
        startId = endId + 1;
        endId = startId + step;
    }
    if (startId < max) {
        partitions.push([startId, Math.min(max, endId)]);
    }
    return partitions;
};