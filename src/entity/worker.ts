import "reflect-metadata"
import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn} from "typeorm"
import {Balance} from "./balance";

@Entity("worker")
export class Worker {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({name: "first_name"})
    firstName: string

    @Column({name: "last_name"})
    lastName: string

    @Column({name: "age"})
    age: number

    @Column({name: "compensation"})
    compensation: number

    @Column({name: "type"})
    type: string

    @Column({name: "days_worked"})
    daysWorked: number

    @OneToOne(() => Balance)
    @JoinColumn({name: "balance_id"})
    balance: Balance
}