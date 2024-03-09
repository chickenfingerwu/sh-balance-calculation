import {DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USERNAME} from "./constants";
import {DataSourceOptions} from "typeorm";

export const options: DataSourceOptions = {
    type: "postgres",
    host: DB_HOST,
    port: parseInt(DB_PORT ? DB_PORT : ""),
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    // logging: true, // enable when dev
    entities: [
        "src/entity/*.ts"
    ],
};