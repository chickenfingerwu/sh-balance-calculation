import "reflect-metadata"
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

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
}