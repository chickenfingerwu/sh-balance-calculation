import "reflect-metadata"
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { OneToOne } from "typeorm";
import { Worker } from "./worker";
import { JoinColumn } from "typeorm";

@Entity("balance")
export class Balance {
    @PrimaryGeneratedColumn('increment')
    id: number

    @OneToOne(() => Worker)
    @JoinColumn({name: "worker_id"})
    worker: Worker

    @Column()
    balance: number

    @Column()
    latest_balance_updated_at: Date
}