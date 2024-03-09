import {BalanceCalc} from "../../business";
import {BalanceRepo} from "../../entity";

jest.mock("../../entity/balance");

describe("calculate balance", () => {
    const mockRepo = new BalanceRepo();
    jest.spyOn(mockRepo, "calcBalanceTable").
        mockImplementation(jest.fn());
    const mockBalanceCalc = new BalanceCalc(mockRepo);

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
            })).toEqual(166.667);
        });
        test("daily worker", () => {
            expect(mockBalanceCalc.calcBalance({
                type: "daily",
                compensation: 1000,
                daysWorked: 5,
            })).toEqual(5000);
        });
        test("invalid type", () => {
            expect(mockBalanceCalc.calcBalance({
                type: "test ignore",
                compensation: 1000,
                daysWorked: 5,
            })).toEqual(0);
        });
    });

    test("processDailyCalcBalance", () => {
        mockBalanceCalc.processDailyCalcBalance();
        expect(mockRepo.calcBalanceTable).toBeCalled();
    });
});