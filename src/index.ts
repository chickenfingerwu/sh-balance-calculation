import "reflect-metadata";
import { BalanceCalc } from "./business";
import { connectDB } from "./infra";
import {BalanceRepo} from "./entity";

const start = async () => {
    const db = await connectDB();
    const balanceRepo = new BalanceRepo(db);
    const service = new BalanceCalc(balanceRepo);
    try {
        await service.processDailyCalcBalance();
    } catch (e) {
        console.log("failed process withdrawal calculation: ", e);
        process.exit(1);
    }
    console.log("finished!");
    await db.destroy();
};

start();