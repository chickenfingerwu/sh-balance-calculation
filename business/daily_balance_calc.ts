import {Repository} from "typeorm";
import {Worker} from "../entity/worker";
import {Balance} from "../entity/balance";

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
    workerRepo: Repository<Worker>
    balanceRepo: Repository<Balance>

    constructor(workerRepo: Repository<Worker>, balanceRepo: Repository<Balance>) {
        this.workerRepo = workerRepo
        this.balanceRepo = balanceRepo
    }
}

export const processDailyCalcBalance = async (service: BalanceCalc) => {
    const startIdx = 0
    const endIdx = 500
    const data = await service.balanceRepo.createQueryBuilder("b").
        innerJoinAndSelect("worker", "w", "b.id >= $1 AND b.id <= $2", [startIdx, endIdx]).
        getMany()

    for (const d of data) {
        await service.balanceRepo.update({id: d.id}, {balance: calcBalance({
                compensation: d.worker.compensation,
                daysWorked: d.worker.daysWorked,
                type: d.worker.type
            })})
    }
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