import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Photo } from "./entity/Photo"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "127.0.0.1",
    port: 3306,
    username: "test",
    password: "test",
    database: "test",
    logging: true,
    entities: [User, Photo],
    migrations: ["typeorm/migration/**/*.ts"],
})
