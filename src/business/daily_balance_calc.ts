import { BalanceRepo } from "../entity";

// contain data about compensation
interface CompData {
    daysWorked: number;
    compensation: number;
}

// contain data about worker
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

    // delegate updating balances record to repo
    processDailyCalcBalance = async () => {
        if (this.balanceRepo) {
            await this.balanceRepo.calcBalanceTable(this.calcBalance);
        }
    };

    // calculate balance base on worker type
    calcBalance = (data: WorkerData): number => {
        if (data.type === "daily") {
            return this.calcBalanceForDailyWorker(data);
        }
        if (data.type === "monthly") {
            return this.calcBalanceForMonthlyWorker(data);
        }
        console.warn("invalid worker type: ", data.type);
        return 0;
    };

    calcBalanceForDailyWorker = (data: CompData): number => {
        return parseFloat((data.compensation * data.daysWorked).toFixed(3));
    };

    calcBalanceForMonthlyWorker = (data: CompData): number => {
        return parseFloat(((data.compensation / 30) * data.daysWorked).toFixed(3));
    };
}
