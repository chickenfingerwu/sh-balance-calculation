import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

// @ts-ignore
@Entity("time_off")
export class TimeOff {
    // @ts-ignore
    @PrimaryGeneratedColumn()
    id: number

    // @ts-ignore
    @Column()
    worker_id: string

    // @ts-ignore
    @Column()
    start_time_off: Date

    // @ts-ignore
    @Column()
    end_time_off: Date

    // @ts-ignore
    @Column()
    pto: boolean
}