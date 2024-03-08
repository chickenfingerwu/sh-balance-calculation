import "reflect-metadata";
import {Entity, PrimaryGeneratedColumn, Column, Repository, DataSource} from "typeorm";
import { OneToOne } from "typeorm";
import { Worker } from "./worker";
import { JoinColumn } from "typeorm";

@Entity("balance")
export class Balance {
    @PrimaryGeneratedColumn("increment")
        id: number;

    @OneToOne(() => Worker)
    @JoinColumn({name: "worker_id"})
        worker: Worker;

    @Column()
        balance: number;

    @Column()
        latest_balance_updated_at: Date;

    @Column({name: "days_worked"})
        daysWorked: number;
}

export class BalanceRepo {
    db: DataSource;
    repo: Repository<Balance>;

    constructor(db: DataSource) {
        this.db = db;
        this.repo = db.getRepository(Balance);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async wrapTransaction( func: () => Promise<any>): Promise<any> {
        const queryRunner = this.db.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            return func();
        } catch(err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async partitionIDs(): Promise<number[][]> {
        const max = await this.repo.maximum("id") as number;
        const min = await this.repo.minimum("id") as number;
        const partitions: number[][] = [];
        const step = Math.ceil(max/4);
        let startId = min;
        let endId = min + step;
        while (endId <= max) {
            partitions.push([startId, Math.min(max, endId)]);
            startId = endId + 1;
            endId = endId + step;
        }
        return partitions;
    }

    async calcBalanceTable(calcFunc: (data: {
        compensation: number
        daysWorked: number
        type: string
    }) => number) {
        const partitions = await this.partitionIDs();

        const promises: Promise<void>[] = partitions.map(async (part): Promise<void> => {
            try {
                await this.wrapTransaction(async () => {
                    const data = await this.repo.createQueryBuilder("b").
                        useTransaction(true).
                        innerJoinAndSelect("b.worker", "w", "b.worker_id = w.id").
                        where("b.id >= :startId AND b.id <= :endId", {startId: part[0], endId: part[1]}).
                        setLock("pessimistic_write").
                        getMany();

                    // tricky way to execute batch update statements with TypeORM
                    let query = "";
                    data.forEach((d: Balance) => {
                        const daysWorked = d.daysWorked + 1;
                        const balance = calcFunc({
                            compensation: d.worker.compensation,
                            daysWorked: daysWorked,
                            type: d.worker.type
                        });

                        query += `INSERT INTO balance(worker_id, balance, days_worked, latest_balance_updated_at)
                                 VALUES('` + d.worker.id + "', " + balance + ", " + daysWorked + `, NOW())
                                 ON CONFLICT (worker_id)
                                 DO UPDATE SET balance = ` + balance + ", days_worked = " + daysWorked + ", latest_balance_updated_at = NOW();";
                    });
                    await this.repo.query(query);

                });
            } catch(err) {
                console.log("failed update: ", err);
                throw err;
            }
        });
        await Promise.allSettled(promises);
    }
}