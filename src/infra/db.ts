import {DataSource, DataSourceOptions} from "typeorm";

export const connectDB = async (options: DataSourceOptions): Promise<DataSource> => {
    try {
        console.log("starting db");
        const dataSource = new DataSource(options);
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
        }
        return dataSource;
    } catch(e) {
        console.log("Cannot connect: ", e);
        throw new Error("error connect to database");
    }
};
