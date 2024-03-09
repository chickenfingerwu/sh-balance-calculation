import "reflect-metadata";
import { BalanceCalc } from "./business";
import {connectDB, options} from "./infra";
import {BalanceRepo} from "./entity";
import { CronJob } from "cron";
import * as readline from "readline";

const start = async () => {
    const db = await connectDB(options);
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

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("Boot up successful!");
rl.question("Do you want to run the program right away? [y/n] ", (answer) => {
    switch(answer.toLowerCase()) {
    case "y":
        start();
        break;
    case "n":
        console.log("Program will run at midnight, waiting...zzz");
        new CronJob("0 0 0 * * *", async () => {
            console.log("starting job");
            await start();
        },
        () => {
            console.log("finished job");
        },
        true,
        "UTC+7");
        break;
    default:
        console.log("Invalid answer!");
    }

    rl.close();
});
