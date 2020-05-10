import { Loan } from '../../../app/models/loan/loan.js';
import { Payment, createPayment } from '../../../app/models/loan/payment.js';
import { avalanche, snowball, double } from '../../../app/models/loan/paymentStrategy.js';

describe('paymentstrategy.model', () => {
    describe('avalanche', () => {
        it('should handle empty lists', () => {
            const payments = [];
            const totalMoney = 1000;
            const dateOfPayment = new Date(1985, 5, 6);

            const result = avalanche(payments, totalMoney, dateOfPayment);

            expect(result).toBeDefined();
            expect(result.length).toBe(0);
        });
        it('should throw an exception if the totalMoney is less than the minimum', () => {
            const loans = [new Loan('Loan 1', 1000, 10, 500), new Loan('Loan 2', 1000, 10, 500)];
            const dateOfPayment = new Date(1985, 5, 6);
            const payments = loans.map((ln) => createPayment(ln, dateOfPayment));
            const totalMoney = 800;

            expect(() => avalanche(payments, totalMoney, dateOfPayment)).toThrowError();
        });
        it('should return payments in the order of greatest to lowest interest', () => {
            const loans = [1,2,3,4,5]
                .map(interest => new Loan(`Loan ${interest}`, 100 * interest, interest, interest * 10));
            const dateOfPayment = new Date(1985, 5, 6);
            const payments = loans.map(ln => createPayment(ln, dateOfPayment));
            const minimumMoney = payments.reduce((acc,x) => acc + x.getMinimumMonthlyPayment(dateOfPayment).amountPaid, 0);
            const totalMoney = minimumMoney + 20;

            const results = avalanche(payments, totalMoney, dateOfPayment);

            expect(results).toBeDefined();
            expect(results.length).toBe(loans.length);
            expect(results[0].loan.interest).toBeCloseTo(5);
            expect(results[1].loan.interest).toBeCloseTo(4);
            expect(results[2].loan.interest).toBeCloseTo(3);
            expect(results[3].loan.interest).toBeCloseTo(2);
            expect(results[4].loan.interest).toBeCloseTo(1);
        });
        it('should not pay more than the principal of the loans', () => {
            const loans = [
                new Loan('Loan 1', 20, 20, 40),
                new Loan('Loan 2', 500, 10, 50)
            ];
            const dateOfPayment = new Date(1985, 5, 6);
            const payments = loans.map(ln => createPayment(ln, dateOfPayment));
            const minimumMoney = payments.reduce((acc,x) => acc + x.getMinimumMonthlyPayment(dateOfPayment).amountPaid, 0);
            const totalMoney = minimumMoney;

            const results = avalanche(payments, totalMoney, dateOfPayment);

            expect(results).toBeDefined();
            expect(results.length).toBe(loans.length);
            expect(results[0].amountPaid).toBeCloseTo(payments[0].principal, 0.01);
            expect(results[1].amountPaid).toBeCloseTo(payments[1].getMinimumMonthlyPayment(dateOfPayment).amountPaid);
        });
        it('should not pay anything for loans that are already paid', () => {
            const loans = [
                new Loan('Loan 1', 20, 20, 40),
                new Loan('Loan 2', 500, 10, 50)
            ];
            const dateOfPayment = new Date(1985, 5, 6);
            const payments = [
                new Payment(loans[0], 0, 20, dateOfPayment),
                new Payment(loans[1], 500, 50, dateOfPayment)
            ];
            const minimumMoney = payments.reduce((acc,x) => 
                acc + x.getMinimumMonthlyPayment(dateOfPayment).amountPaid, 0);
            const totalMoney = minimumMoney;

            const results = avalanche(payments, totalMoney, dateOfPayment);

            expect(results).toBeDefined();
            expect(results.length).toBe(1);
            expect(results[0].amountPaid).toBeCloseTo(totalMoney);
        });
    });
    describe('snowball', () => {
        it('should handle empty lists', () => {
            const payments = [];
            const totalMoney = 1000;
            const dateOfPayment = new Date(1985, 5, 6);

            const result = snowball(payments, totalMoney, dateOfPayment);

            expect(result).toBeDefined();
            expect(result.length).toBe(0);
        });
        it('should throw an exception if the totalMoney is less than the minimum', () => {
            const loans = [new Loan('Loan 1', 1000, 10, 500), new Loan('Loan 2', 1000, 10, 500)];
            const dateOfPayment = new Date(1985, 5, 6);
            const payments = loans.map((ln) => createPayment(ln, dateOfPayment));
            const totalMoney = 800;

            expect(() => snowball(payments, totalMoney, dateOfPayment)).toThrowError();
        });
        it('should return payments in the order of lowest to greatest principal', () => {
            const loans = [5,4,3,2,1]
                .map(principal => new Loan(`Loan ${principal}`, 100 * principal, 10, 10));
            const dateOfPayment = new Date(1985, 5, 6);
            const payments = loans.map(ln => createPayment(ln, dateOfPayment));
            const minimumMoney = payments.reduce((acc,x) => acc + x.getMinimumMonthlyPayment(dateOfPayment).amountPaid, 0);
            const totalMoney = minimumMoney + 20;

            const results = snowball(payments, totalMoney, dateOfPayment);

            expect(results).toBeDefined();
            expect(results.length).toBe(loans.length);
            expect(results[0].loan.name).toBe('Loan 1');
            expect(results[1].loan.name).toBe('Loan 2');
            expect(results[2].loan.name).toBe('Loan 3');
            expect(results[3].loan.name).toBe('Loan 4');
            expect(results[4].loan.name).toBe('Loan 5');
        });
        it('should not pay more than the principal of the loans', () => {
            const loans = [
                new Loan('Loan 1', 20, 20, 40),
                new Loan('Loan 2', 500, 10, 50)
            ];
            const dateOfPayment = new Date(1985, 5, 6);
            const payments = loans.map(ln => createPayment(ln, dateOfPayment));
            const minimumMoney = payments.reduce((acc,x) => acc + x.getMinimumMonthlyPayment(dateOfPayment).amountPaid, 0);
            const totalMoney = minimumMoney;

            const results = snowball(payments, totalMoney, dateOfPayment);

            expect(results).toBeDefined();
            expect(results.length).toBe(loans.length);
            expect(results[0].amountPaid).toBeCloseTo(payments[0].principal, 0.01);
            expect(results[1].amountPaid).toBeCloseTo(payments[1].getMinimumMonthlyPayment(dateOfPayment).amountPaid);
        });
        it('should not pay anything for loans that are already paid', () => {
            const loans = [
                new Loan('Loan 1', 20, 20, 40),
                new Loan('Loan 2', 500, 10, 50)
            ];
            const dateOfPayment = new Date(1985, 5, 6);
            const payments = [
                new Payment(loans[0], 0, 20, dateOfPayment),
                new Payment(loans[1], 500, 50, dateOfPayment)
            ];
            const minimumMoney = payments.reduce((acc,x) => 
                acc + x.getMinimumMonthlyPayment(dateOfPayment).amountPaid, 0);
            const totalMoney = minimumMoney;

            const results = snowball(payments, totalMoney, dateOfPayment);

            expect(results).toBeDefined();
            expect(results.length).toBe(1);
            expect(results[0].amountPaid).toBeCloseTo(totalMoney);
        });
    });
    describe('double', () => {
        it('should handle empty lists', () => {
            const payments = [];
            const totalMoney = 1000;
            const dateOfPayment = new Date(1985, 5, 6);

            const result = double(payments, totalMoney, dateOfPayment);

            expect(result).toBeDefined();
            expect(result.length).toBe(0);
        });
        it('should throw an exception if the totalMoney is less than the minimum', () => {
            const loans = [new Loan('Loan 1', 1000, 10, 500), new Loan('Loan 2', 1000, 10, 500)];
            const dateOfPayment = new Date(1985, 5, 6);
            const payments = loans.map((ln) => createPayment(ln, dateOfPayment));
            const totalMoney = 800;

            expect(() => double(payments, totalMoney, dateOfPayment)).toThrowError();
        });
        it('should return payments in order of the the largest to smallest interest', () => {
            const loans = [1,2,3,4,5]
                .map(interest => new Loan(`Loan ${interest}`, 100 * interest, interest, interest * 10));
            const dateOfPayment = new Date(1985, 5, 6);
            const payments = loans.map(ln => createPayment(ln, dateOfPayment));
            const minimumMoney = payments.reduce((acc,x) => acc + x.getMinimumMonthlyPayment(dateOfPayment).amountPaid, 0);
            const totalMoney = minimumMoney + 20;

            const results = double(payments, totalMoney, dateOfPayment);

            expect(results).toBeDefined();
            expect(results.length).toBe(loans.length);
            expect(results[0].loan.interest).toBeCloseTo(5);
            expect(results[1].loan.interest).toBeCloseTo(4);
            expect(results[2].loan.interest).toBeCloseTo(3);
            expect(results[3].loan.interest).toBeCloseTo(2);
            expect(results[4].loan.interest).toBeCloseTo(1);
        });
        it('should mark loans that can be doubled', () => {
            const loans = [1,2,3,4,5]
                .map(interest => new Loan(`Loan ${interest}`, 100 * interest, interest, interest * 10));
            const dateOfPayment = new Date(1985, 5, 6);
            const payments = loans.map(ln => createPayment(ln, dateOfPayment));
            const minimumMoney = payments.reduce((acc,x) => acc + x.getMinimumMonthlyPayment(dateOfPayment).amountPaid, 0);
            const totalMoney = minimumMoney + payments[3].amountPaid;

            const results = double(payments, totalMoney, dateOfPayment);

            expect(results).toBeDefined();
            expect(results.length).toBe(loans.length);
            expect(results[0].loan.interest).toBeCloseTo(5);
            expect(results[1].loan.interest).toBeCloseTo(4);
            expect(results[1].wasDoubled).toBeTruthy();
            expect(results[2].loan.interest).toBeCloseTo(3);
            expect(results[3].loan.interest).toBeCloseTo(2);
            expect(results[4].loan.interest).toBeCloseTo(1);
        });
        it('should pay the minimums if none of the loans can be doubled', () => {
            const loans = [1,2,3,4,5]
                .map(interest => new Loan(`Loan ${interest}`, 100 * interest, interest, interest * 10));
            const dateOfPayment = new Date(1985, 5, 6);
            const payments = loans.map(ln => createPayment(ln, dateOfPayment));
            const minimumMoney = payments.reduce((acc,x) => acc + x.getMinimumMonthlyPayment(dateOfPayment).amountPaid, 0);
            const totalMoney = minimumMoney;

            const results = double(payments, totalMoney, dateOfPayment);

            expect(results).toBeDefined();
            expect(results.length).toBe(loans.length);
            expect(results[0].loan.interest).toBeCloseTo(5);
            expect(results[1].loan.interest).toBeCloseTo(4);
            expect(results[2].loan.interest).toBeCloseTo(3);
            expect(results[3].loan.interest).toBeCloseTo(2);
            expect(results[4].loan.interest).toBeCloseTo(1);
            expect(results.every(x => x.wasDoubled == false)).toBeTruthy();
        });
        it('should not pay more than the principal of the loans', () => {
            const loans = [
                new Loan('Loan 1', 20, 20, 40),
                new Loan('Loan 2', 500, 10, 50)
            ];
            const dateOfPayment = new Date(1985, 5, 6);
            const payments = loans.map(ln => createPayment(ln, dateOfPayment));
            const minimumMoney = payments.reduce((acc,x) => acc + x.getMinimumMonthlyPayment(dateOfPayment).amountPaid, 0);
            const totalMoney = minimumMoney;

            const results = double(payments, totalMoney, dateOfPayment);

            expect(results).toBeDefined();
            expect(results.length).toBe(loans.length);
            expect(results[0].amountPaid).toBeCloseTo(payments[0].principal, 0.01);
            expect(results[1].amountPaid).toBeCloseTo(payments[1].getMinimumMonthlyPayment(dateOfPayment).amountPaid);
        });
        it('should not pay anything for loans that are already paid', () => {
            const loans = [
                new Loan('Loan 1', 20, 20, 40),
                new Loan('Loan 2', 500, 10, 50)
            ];
            const dateOfPayment = new Date(1985, 5, 6);
            const payments = [
                new Payment(loans[0], 0, 20, dateOfPayment),
                new Payment(loans[1], 500, 50, dateOfPayment)
            ];
            const minimumMoney = payments.reduce((acc,x) => 
                acc + x.getMinimumMonthlyPayment(dateOfPayment).amountPaid, 0);
            const totalMoney = minimumMoney;

            const results = double(payments, totalMoney, dateOfPayment);

            expect(results).toBeDefined();
            expect(results.length).toBe(1);
            expect(results[0].amountPaid).toBeCloseTo(totalMoney);
        });
    });
});