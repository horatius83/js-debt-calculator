import { PaymentPlan } from '../../../app/models/loan/paymentPlan.js';
import { Loan } from '../../../app/models/loan/loan.js';
import { LoanPaymentPlan } from '../../../app/models/loan/loanPaymentPlan.js';
import { Payment, createPayment } from '../../../app/models/loan/payment.js';
import { avalanche } from '../../../app/models/loan/paymentStrategy.js';

describe('paymentplan.model', () => {
    it('should be able to initialize', () => {
        const loans = [1, 2, 3, 4, 5].map(i => new Loan(`Loan ${i}`, i * 100, i, i * 10));
        const paymentPlan = new PaymentPlan(loans);

        expect(paymentPlan).toBeDefined();
    });
    describe('getMinimumPayments', () => {
        it('should handle an empty array', () => {
            const paymentPlan = new PaymentPlan([]);
            const dateOfPayment = new Date(2019,1,22);

            const result = paymentPlan.getMinimumPayments(dateOfPayment);

            expect(result).toBeDefined();
            expect(result.length).toBe(0);
        });
        it('should calculate the minimumPayments for the latest payments', () => {
            const loans = [1, 2, 3, 4, 5].map(i => new Loan(`Loan ${i}`, i * 100, i, i * 10));
            const paymentPlan = new PaymentPlan(loans);
            const dateOfPayment = new Date(2019,1,22);
            const expectedMinimumPayments = loans
                .map(x => new LoanPaymentPlan(x).getMinimumPayment(dateOfPayment))
                .reduce((dict, x) => {
                    dict.set(x.loan.name, x);
                    return dict;
                }, new Map())

            const results = paymentPlan.getMinimumPayments(dateOfPayment);

            for(const payment of results) {
                expect(expectedMinimumPayments.has(payment.loan.name)).toBeTruthy();
                const expectedPayment = expectedMinimumPayments.get(payment.loan.name);
                expect(payment.amountPaid).toBeCloseTo(expectedPayment.amountPaid);
                expect(payment.principal).toBeCloseTo(expectedPayment.principal);
                expect(payment.wasDoubled).toBe(expectedPayment.wasDoubled);
            }
        });
    });
    describe('getTotalAmountPaid', () => {
        it('should handle an empty array', () => {
            const loans = [];
            const payments = [];
            const paymentPlan = new PaymentPlan(loans);

            const result = paymentPlan.getTotalAmountPaid(payments);

            expect(result).toBeDefined();
            expect(result).toBe(0);
        });
        it('should get the totalAmountPaid for the latest payments', () => {
            const loan = new Loan('test', 5000, 10, 50);
            const loans = [];
            const dateOfPayment = new Date(1985, 5, 6);
            const payments = [1,2,3,4,5].map(x => new Payment(loan, 5000, 1, dateOfPayment));
            const paymentPlan = new PaymentPlan(loans);

            const result = paymentPlan.getTotalAmountPaid(payments);

            expect(result).toBeDefined();
            expect(result).toBeCloseTo(5);
        });
    });
    describe('applyPaymentPlanForThisMonth', () => {
        it('should return false if there are no payments to be made in that month', () => {
            const loans = [];
            const paymentPlan = new PaymentPlan(loans);
            const dateOfPayment = new Date(2017, 6, 26);
            const totalMonthlyPaymentAmount = 1000;

            const result = paymentPlan.applyPaymentPlanForThisMonth(dateOfPayment, totalMonthlyPaymentAmount, avalanche);

            expect(result).toBeDefined();
            expect(result).toBe(false);
        }); 
        it('should throw an exception if the totalAmount is less than the minimum', () => {
            const loans = [1, 2, 3, 4, 5].map(i => new Loan(`Loan ${i}`, i * 100, i, i * 10));
            const paymentPlan = new PaymentPlan(loans);
            const dateOfPayment = new Date(2019,1,22);
            const minimumAmount = paymentPlan.getMinimumPayments(dateOfPayment)
                .reduce((acc, x) => acc + x.amountPaid, 0);
            const monthlyPaymentAmount = minimumAmount - 5;

            expect(() => paymentPlan
                .applyPaymentPlanForThisMonth(dateOfPayment, monthlyPaymentAmount, avalanche))
                .toThrow(new Error(`Monthly payment amount ${monthlyPaymentAmount} was less than the minimum amount needed ${minimumAmount}`))
        });
        it('should return false if the principals are all 0', () => {
            const loans = [1, 2, 3, 4, 5].map(i => new Loan(`Loan ${i}`, i * 100, i, i * 10));
            const paymentPlan = new PaymentPlan(loans);
            const monthlyPaymentAmount = 10000;

            const firstMonth = paymentPlan.applyPaymentPlanForThisMonth(new Date(2018,11,22), monthlyPaymentAmount, avalanche);

            expect(firstMonth).toBeFalsy();
        })
        it('should apply the payment strategy and add those payments to the lists', () => {
            const loans = [1, 2, 3, 4, 5].map(i => new Loan(`Loan ${i}`, i * 100, i, i * 10));
            const paymentPlan = new PaymentPlan(loans);
            const dateOfPayment = new Date(2019,1,22);
            const monthlyPaymentAmount = 1200;
            const expectedPaymentMap = avalanche(loans.map(
                ln => createPayment(ln, dateOfPayment)), 
                monthlyPaymentAmount, 
                dateOfPayment)
                .reduce((dict, p) => {
                    dict.set(p.loan.name, p);
                    return dict;
                }, new Map())
            
            const result = paymentPlan.applyPaymentPlanForThisMonth(dateOfPayment, monthlyPaymentAmount, avalanche);

            expect(result).toBeTruthy();
            for(const [loanName, loanPaymentPlan] of paymentPlan.paymentPlans.entries()) {
                expect(expectedPaymentMap.has(loanName)).toBeTruthy();
                const expectedPayment = expectedPaymentMap.get(loanName);
                const paymentPlanPayment = loanPaymentPlan.getMostRecentPayment(dateOfPayment);
                expect(paymentPlanPayment.amountPaid).toBeCloseTo(expectedPayment.amountPaid);
                expect(paymentPlanPayment.dateOfPayment).toBe(expectedPayment.dateOfPayment);
                expect(paymentPlanPayment.loan.name).toBe(expectedPayment.loan.name);
                expect(paymentPlanPayment.principal).toBeCloseTo(expectedPayment.principal);
                expect(paymentPlanPayment.wasDoubled).toBe(expectedPayment.wasDoubled);
            }
        });
    });
    describe('createPaymentPlan', () => {
        it('should throw an exception if the payments are undefined', () => {
            expect(() => new PaymentPlan(undefined))
            .toThrow(new Error('Cannot create a payment plan with undefined loans'))
        });
        it('should throw an exception if the total amount paid is less than the minimums', () => {
            const loans = [1, 2, 3, 4, 5].map(i => new Loan(`Loan ${i}`, i * 100, i, i * 10));
            const paymentPlan = new PaymentPlan(loans);
            const dateOfPayment = new Date(2019,1,22);
            const minimumAmount = paymentPlan.getMinimumPayments(dateOfPayment)
                .reduce((acc, x) => acc + x.amountPaid, 0);
            const monthlyPaymentAmount = minimumAmount - 5;

            expect(() => paymentPlan
                .createPaymentPlan(dateOfPayment, monthlyPaymentAmount, avalanche))
                .toThrow(new Error(`Monthly payment amount ${monthlyPaymentAmount} was less than the minimum amount needed ${minimumAmount}`))
        });
        it('should handle it if all the loans get paid off in the first month', () => {
            const loans = [1, 2, 3, 4, 5].map(i => new Loan(`Loan ${i}`, i * 100, i, i * 10));
            const paymentPlan = new PaymentPlan(loans);
            const dateOfPayment = new Date(2019,1,22);
            const monthlyPaymentAmount = 10000;

            paymentPlan.createPaymentPlan(dateOfPayment, monthlyPaymentAmount, avalanche);

            expect(paymentPlan.paymentPlans.size).toBe(loans.length);
            for(const [_, loanPaymentPlan] of paymentPlan.paymentPlans.entries()) {
                expect(loanPaymentPlan.payments.length).toBe(1);
            }
        });
        it('should stop processing if the payment plan takes an incredibly long time', () => {
            const loans = [1, 2, 3, 4, 5].map(i => new Loan(`Loan ${i}`, i * 100000000, i/10000, i * 10));
            const maxNumberOfPayments = 5;
            const paymentPlan = new PaymentPlan(loans, maxNumberOfPayments);
            const dateOfPayment = new Date(2019,1,22);
            const monthlyPaymentAmount = 1200;
            
            expect(() => paymentPlan
                .createPaymentPlan(dateOfPayment, monthlyPaymentAmount, avalanche))
                .toThrow(new Error(`Payments exceeded the maximum number of payments (${maxNumberOfPayments})`))
        });
        it('should continue processing until all the loans are paid off', () => {
            const loans = [1, 2, 3, 4, 5].map(i => new Loan(`Loan ${i}`, i * 100, i, i * 10));
            const paymentPlan = new PaymentPlan(loans);
            const dateOfPayment = new Date(2019,1,22);
            const monthlyPaymentAmount = 1200;
            
            paymentPlan.createPaymentPlan(dateOfPayment, monthlyPaymentAmount, avalanche);

            expect(paymentPlan.paymentPlans.size).toBe(loans.length);
            for(const [_, loanPaymentPlan] of paymentPlan.paymentPlans.entries()) {
                expect(loanPaymentPlan.payments.length).toBeLessThanOrEqual(2);
            }
        });
    });
});