import "reflect-metadata";
import { BalanceCalc } from "./business";
import { connectDB } from "./infra";
import {BalanceRepo} from "./entity";
import { CronJob } from "cron";

const start = async () => {
    const db = await connectDB();
    const balanceRepo = new BalanceRepo(db);
    const service = new BalanceCalc(balanceRepo);
    try {
        console.log("start process daily balance");
        await service.processDailyCalcBalance();
    } catch (e) {
        console.log("failed process withdrawal calculation: ", e);
        process.exit(1);
    }
    console.log("finished!");
    await db.destroy();
};

new CronJob("0 0 0 * * *", async () => {
    console.log("starting job");
    await start();
},
() => {
    console.log("finished job");
},
true,
"UTC+7");