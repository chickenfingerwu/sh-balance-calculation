import "reflect-metadata";
import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity("worker")
export class Worker {
    @PrimaryGeneratedColumn("uuid")
        id: string;

    @Column({name: "first_name", type: "varchar", length: 50})
        firstName: string;

    @Column({name: "last_name", type: "varchar", length: 50})
        lastName: string;

    @Column({name: "age", type: "int"})
        age: number;

    @Column({name: "compensation", type: "float"})
        compensation: number;

    @Column({name: "type", type: "varchar", length: 50})
        type: string;
}