import "reflect-metadata"
import { DataSource, DataSourceOptions } from "typeorm"
import { BalanceCalc, processDailyCalcBalance } from "../business/daily_balance_calc";
import { Worker } from "../entity/worker";
import { Balance } from "../entity/balance";

const options: DataSourceOptions = {
    type: "postgres",
    host: "localhost",
    port: 3000,
    username: "admin",
    password: "password",
    database: "balance-service",
    logging: true,
}

const connectDB = (): DataSource => {
    try {
        console.log("starting db")
        const dataSource = new DataSource(options)
        dataSource.initialize().then(
            (error) => console.log("Cannot connect: ", error),
        )
        return dataSource
    } catch(e) {
        throw new Error("error connect to database")
    }
}

const start = async () => {
    const db = connectDB()
    const workerRepo = db.getRepository(Worker)
    const balanceRepo = db.getRepository(Balance)
    const service = new BalanceCalc(workerRepo, balanceRepo)
    try {
        await processDailyCalcBalance(service)
    } catch (e) {
        console.log("failed process withdrawal calculation: ", e)
    }
}

start()