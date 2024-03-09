import {BalanceCalc} from "../../business";

describe("calculate balance", () => {
    const mockBalanceCalc = new BalanceCalc();

    test("calcBalanceForDailyWorker", () => {
        expect(mockBalanceCalc.calcBalanceForDailyWorker({
            compensation: 1000,
            daysWorked: 10,
        })).toBe(10000);
    });

    test("calcBalanceForMonthlyWorker", () => {
        expect(mockBalanceCalc.calcBalanceForMonthlyWorker({
            compensation: 1000,
            daysWorked: 10,
        })).toBe(333.333);
    });

    describe("calcBalance", () => {
        test("monthly worker", () => {
            expect(mockBalanceCalc.calcBalance({
                type: "monthly",
                compensation: 1000,
                daysWorked: 5,
            })).toBe(166.667);
        });
        test("daily worker", () => {
            expect(mockBalanceCalc.calcBalance({
                type: "daily",
                compensation: 1000,
                daysWorked: 5,
            })).toBe(5000);
        });
    });
});