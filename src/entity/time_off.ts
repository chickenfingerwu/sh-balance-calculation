import "reflect-metadata"
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity("time_off")
export class TimeOff {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    worker_id: string

    @Column()
    start_time_off: Date

    @Column()
    end_time_off: Date

    @Column()
    pto: boolean
}