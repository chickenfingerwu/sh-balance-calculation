import "reflect-metadata"
import { DataSource, DataSourceOptions } from "typeorm"
import { BalanceCalc, processDailyCalcBalance } from "./business/daily_balance_calc"

const options: DataSourceOptions = {
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "admin",
    password: "password",
    database: "salary_hero",
    logging: true,
    entities: [
        __dirname + "/entity/*.ts"
    ],
}

const connectDB = async (): Promise<DataSource> => {
    try {
        console.log("starting db")
        const dataSource = new DataSource(options)
        if (!dataSource.isInitialized) {
            await dataSource.initialize().then(()=>{},
                (error) => console.log("Cannot connect: ", error),
            )
        }
        return dataSource
    } catch(e) {
        throw new Error("error connect to database")
    }
}

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