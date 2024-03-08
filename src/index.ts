import "reflect-metadata"
import { BalanceCalc, processDailyCalcBalance } from "./business"
import { connectDB } from "./infra";

const start = async () => {
    const db = await connectDB()
    const service = new BalanceCalc(db)
    try {
        await processDailyCalcBalance(service)
    } catch (e) {
        console.log("failed process withdrawal calculation: ", e)
    }
    console.log("finished!")
    await db.destroy()
}

start()