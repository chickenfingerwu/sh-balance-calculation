import {TEST_DB_HOST, TEST_DB_USERNAME, TEST_DB_PASSWORD, TEST_DB_PORT, TEST_DB_DATABASE} from "./constants";
import {DataSourceOptions} from "typeorm";

export const testOptions: DataSourceOptions = {
    type: "postgres",
    host: TEST_DB_HOST,
    port: parseInt(TEST_DB_PORT ? TEST_DB_PORT : ""),
    username: TEST_DB_USERNAME,
    password: TEST_DB_PASSWORD,
    database: TEST_DB_DATABASE,
    // logging: true, // enable when dev
    entities: [
        "src/entity/*.ts"
    ],
};