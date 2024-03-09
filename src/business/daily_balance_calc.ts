import { BalanceRepo } from "../entity";

interface CompData {
    daysWorked: number;
    compensation: number;
}

interface WorkerData {
    compensation: number;
    daysWorked: number;
    type: string;
}

export class BalanceCalc {
    balanceRepo?: BalanceRepo;

    constructor(balanceRepo?: BalanceRepo) {
        this.balanceRepo = balanceRepo;
    }

    processDailyCalcBalance = async () => {
        if (this.balanceRepo) {
            await this.balanceRepo.calcBalanceTable(this.calcBalance);
        }
    };

    calcBalance = (data: WorkerData): number => {
        if (data.type === "daily") {
            return this.calcBalanceForDailyWorker(data);
        }
        return this.calcBalanceForMonthlyWorker(data);
    };

    calcBalanceForDailyWorker = (data: CompData): number => {
        return parseFloat((data.compensation * data.daysWorked).toFixed(3));
    };

    calcBalanceForMonthlyWorker = (data: CompData): number => {
        return parseFloat(((data.compensation / 30) * data.daysWorked).toFixed(3));
    };
}
