import {connectDB} from "../../infra";
import {testOptions} from "../infra/config";
import {Balance, BalanceRepo, partitionByRange, Worker} from "../../entity";
import {DataSource, Repository} from "typeorm";
import {BalanceCalc} from "../../business";

const truncateAllTable = async (db: DataSource) => {
    await db.query("TRUNCATE worker, balance;");
};

describe("balance repo", () => {
    let db: DataSource;
    let balanceRepo: BalanceRepo;
    let workerRepo: Repository<Worker>;
    const mockWorkerData = [
        {
            id: "e8201668-3a9d-4ea2-aed9-4b07e8225df3",
            compensation: 1000,
            type: "monthly"
        },
        {
            id: "862736b8-80db-4860-b174-5bbae4561138",
            compensation: 1200,
            type: "daily"
        },
    ];
    const mockBalanceData = [
        {
            id: 1,
            workerID: "e8201668-3a9d-4ea2-aed9-4b07e8225df3",
            daysWorked: 10,
        },
        {
            id: 2,
            workerID: "862736b8-80db-4860-b174-5bbae4561138",
            daysWorked: 9,
        }
    ];

    beforeEach(async () => {
        db = await connectDB(testOptions);
        balanceRepo = new BalanceRepo(db);
        workerRepo = db.getRepository(Worker);

        for (const d of mockWorkerData) {
            await workerRepo.save(d as Worker);
        }

        for (const d of mockBalanceData) {
            await balanceRepo.saveBalance(d as Balance);
        }
    });
    afterEach(async () => {
        await truncateAllTable(db);
    });
    afterAll(async () => {
        await db.destroy();
    });

    test("calcBalanceTable", async () => {
        const balanceCalc = new BalanceCalc(balanceRepo);
        await balanceRepo.calcBalanceTable(balanceCalc.calcBalance);

        const expected: Balance[] = [
            {
                id: 1,
                workerID: "e8201668-3a9d-4ea2-aed9-4b07e8225df3",
                balance: 366.667,
                daysWorked: 11,
            } as Balance,
            {
                id: 2,
                workerID: "862736b8-80db-4860-b174-5bbae4561138",
                balance: 12000,
                daysWorked: 10,
            } as Balance
        ];

        let actual = await balanceRepo.getBalance(mockWorkerData[0].id);
        expect(actual?.balance).toBe(expected[0].balance);
        expect(actual?.daysWorked).toBe(expected[0].daysWorked);

        actual = await balanceRepo.getBalance(mockWorkerData[1].id);
        expect(actual?.balance).toBe(expected[1].balance);
        expect(actual?.daysWorked).toBe(expected[1].daysWorked);
    });
});

describe("partition helper", () => {
    test("partitionByRange", async () => {
        const tests = [
            {
                min: 1,
                max: 4,
                partitionsCount: 2,
                expect: [[1, 2], [3, 4]]
            },
            {
                min: 1,
                max: 10,
                partitionsCount: 3,
                expect: [[1, 4], [5, 8], [9, 10]]
            },
            {
                min: 9,
                max: 20,
                partitionsCount: 3,
                expect: [[9, 12], [13, 16], [17, 20]]
            },
            {
                min: 1,
                max: 4,
                partitionsCount: 4,
                expect: [[1, 1], [2, 2], [3, 3], [4, 4]]
            }
        ];
        tests.forEach(t => {
            const actual = partitionByRange(t.min, t.max, t.partitionsCount);
            expect(actual).toStrictEqual(t.expect);
        });
    });
});