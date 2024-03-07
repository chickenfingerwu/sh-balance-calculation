import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

// @ts-ignore
@Entity("worker")
export class Worker {
    // @ts-ignore
    @PrimaryGeneratedColumn()
    id: number

    // @ts-ignore
    @Column()
    firstName: string

    // @ts-ignore
    @Column()
    lastName: string

    // @ts-ignore
    @Column()
    age: number

    // @ts-ignore
    @Column()
    compensation: number

    // @ts-ignore
    @Column()
    type: string

    // @ts-ignore
    @Column()
    daysWorked: number
}