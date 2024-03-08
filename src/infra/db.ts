import {DataSource} from "typeorm";
import {options} from "./config";

export const connectDB = async (): Promise<DataSource> => {
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
