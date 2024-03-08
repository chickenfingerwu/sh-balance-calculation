import {DataSource, Repository} from "typeorm";
import {Balance, Worker} from "../entity";

interface CompData {
    daysWorked: number;
    compensation: number;
}

interface WorkerData {
    compensation: number;
    type: string;
    daysWorked: number;
}

export class BalanceCalc {
    db: DataSource
    workerRepo: Repository<Worker>
    balanceRepo: Repository<Balance>

    constructor(db: DataSource) {
        this.db = db
        this.workerRepo = db.getRepository(Worker)
        this.balanceRepo = db.getRepository(Balance)
    }
}

export const processDailyCalcBalance = async (service: BalanceCalc) => {
    const max = await service.balanceRepo.maximum("id") as number
    const min = await service.balanceRepo.minimum("id") as number
    const sections: {
        startId: number;
        endId: number;
    }[] = []
    const step = Math.ceil(max/4)
    let startId = min
    let endId = min + step
    while (endId <= max) {
        sections.push({
            startId: startId,
            endId: Math.min(max, endId)
        })
        startId = endId + 1
        endId = endId + step
    }

    const promises: Promise<any>[] = sections.map(async (sec): Promise<any> => {
        try {
            const queryRunner = service.db.createQueryRunner()
            await queryRunner.connect()
            await queryRunner.startTransaction()
            try {
                const data = await service.workerRepo.createQueryBuilder("w").
                    useTransaction(true).
                    leftJoinAndSelect("w.balance", "b", "w.balance_id = b.id").
                    where("b.id >= :startId AND b.id <= :endId", {startId: sec.startId, endId: sec.endId}).
                    setLock("pessimistic_write").
                    getMany()

                // tricky way to execute batch update statements with TypeORM
                let query = ""
                data.forEach((d: any) => {
                    const balance = parseFloat(calcBalance({
                        compensation: d.compensation,
                        daysWorked: d.daysWorked,
                        type: d.type
                    }).toFixed(3))

                    query += `INSERT INTO balance(worker_id, balance, latest_balance_updated_at)
                             VALUES('` + d.id + `', ` + balance + `, NOW())
                             ON CONFLICT (worker_id)
                             DO UPDATE SET balance = ` + balance + `, latest_balance_updated_at = NOW();`
                })
                const result = await queryRunner.query(query)

                await queryRunner.commitTransaction()
                return result
            } catch(err) {
                console.log("failed update: ", err)
                await queryRunner.rollbackTransaction()
            } finally {
                await queryRunner.release()
            }
        } catch (err) {
            console.log("failed create transaction: ", err)
        }

    })
    await Promise.allSettled(promises)
}

export const calcBalance = (data: WorkerData): number => {
    if (data.type == "daily") {
        return calcBalanceForDailyWorker(data)
    }
    return calcBalanceForMonthlyWorker(data)
}

export const calcBalanceForDailyWorker = (data: CompData): number => {
    return data.compensation * data.daysWorked
}

export const calcBalanceForMonthlyWorker = (data: CompData): number => {
    return (data.compensation / 30) * data.daysWorked
}