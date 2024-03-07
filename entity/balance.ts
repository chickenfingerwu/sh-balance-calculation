import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import {OneToOne} from "typeorm";
import {Worker} from "./worker";
import {JoinColumn} from "typeorm";

// @ts-ignore
@Entity("balance")
export class Balance {
    // @ts-ignore
    @PrimaryGeneratedColumn('increment')
    id: number

    // @ts-ignore
    @OneToOne(() => Worker)
    // @ts-ignore
    @JoinColumn()
    worker: Worker

    // @ts-ignore
    @Column()
    balance: number

    // @ts-ignore
    @Column()
    latest_balance_updated_at: Date
}