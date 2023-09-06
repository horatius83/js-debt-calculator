import { getMinimumMonthlyPaymentWithinPeriod } from "../../app/modules/interest.mjs";
import { avalancheRepayment, snowballRepayment, Loan, LoanRepayment, Payment, EmergencyFund, PaymentPlan, MAXIMUM_NUMBER_OF_YEARS } from "../../app/modules/paymentPlan.mjs";

describe('paymentPlan', () => {
    describe('Loan', () => {
        describe('principal', () => {
            it('should be greater than 0', () => {
                expect(() => new Loan('Test', 0, 0.1, 10))
                .toThrow(new Error(`Principal (0) cannot be less than or equal to 0`));
            })
        }),
        describe('interest', () => {
            it('should be greater than or equal to 0', () => {
                expect(() => new Loan('Test', 1000, -1, 10))
                .toThrow(new Error('Interest (-1) cannot be less than 0'));
            })
        })
        describe('minimum', () => {
            it('should be greater than 0', () => {
                expect(() => new Loan('Test', 1000, 0.1, 0))
                .toThrow(new Error('Minimum (0) cannot be less than or equal to 0'));
            })
        })
    }),
    describe('Payment', () => {
        describe('paid', () => {
            it('should be greater than 0', () => {
                expect(() => new Payment(0, 100, false))
                .toThrow(new Error('Paid (0) cannot be less than or equal to 0'));
            })
        }),
        describe('remaining', () => {
            it('should be greater than or equal to 0', () => {
                expect(() => new Payment(100, -1, false))
                .toThrow(new Error('Remaining (-1) cannot be less than 0'));
            });
        })
    }),
    describe('LoanRepayment', () => {
        it('should calculate minimum payment', () => {
            const ln = new Loan('Test Loan', 1000, 0.1, 10);
            const lnr = new LoanRepayment(ln);
            const years = 6;
            const minimum = getMinimumMonthlyPaymentWithinPeriod(ln.principal, ln.interest, ln.minimum, years);

            const result = lnr.getMinimum(years);

            expect(result).toBeCloseTo(minimum);
        })
    }),
    describe('avalancheRepayment', () => {
        it('should order loans by interest rate', () => {
            let loans = [1,2,3,4,5]
                .map(x => new Loan(`Test Loan ${x}`, 1000, x * 0.1, 100))

            const result = avalancheRepayment(loans);

            expect(result).toBeDefined();
            expect(result.length).toBe(5);
            expect(result[0].interest).toBeCloseTo(5 * 0.1);
        }),
        it('should not modify the input', () => {
            let loans = [1,2,3,4,5].map(x => new Loan(`Test Loan ${x}`, 1000, x / 10.0, 100))

            const result = avalancheRepayment(loans);

            expect(loans[0].interest).toBeCloseTo(0.1);
            expect(result[0].interest).toBeCloseTo(0.5);
        }),
        it('should handle empty arrays', () => {
            const result = avalancheRepayment([]);

            expect(result).toBeDefined();
            expect(result.length).toBe(0);
        })
    }),
    describe('snowballRepayment', () => {
        it('should order loans by principal', () => {
            let loans = [1,2,3,4,5]
                .reverse()
                .map(x => new Loan(`Test Loan ${x}`, 1000 * x, x / 10.0, 100));

            const result = snowballRepayment(loans);

            expect(result).toBeDefined();
            expect(result.length).toBe(5);
            expect(result[0].principal).toBeCloseTo(1000);
        }),
        it('should not modify the input', () => {
            let loans = [1,2,3,4,5]
                .reverse()
                .map(x => new Loan(`Test Loan ${x}`, 1000 * x, x / 10.0, 100));

            const result = snowballRepayment(loans);

            expect(loans[0].principal).toBeCloseTo(5000);
            expect(result[0].principal).toBeCloseTo(1000);
        }),
        it('should handle empty arrays', () => {
            const result = snowballRepayment([]);

            expect(result).toBeDefined();
            expect(result.length).toBe(0);
        })
    }),
    describe('EmergencyFund', () => {
        describe('constructor', () => {
           it('should not accept a target amount less than or equal to 0', () => {
                expect(() => new EmergencyFund(-1, 1)).toThrow(new Error('Target Amount (-1) cannot be less than or equal to 0'));
           }),
           it('cannot be less than 0', () => {
                expect(() => new EmergencyFund(1000, -1)).toThrow(new Error('Percentage of Bonus Funds (-1) must be between (0) and (1)'));
           }),
           it('cannot be greater than 1', () => {
                expect(() => new EmergencyFund(1000, 2)).toThrow(new Error('Percentage of Bonus Funds (2) must be between (0) and (1)'));
           })
        }),
        describe('addPayment', () => {
            it('must have an amount greater than 0', () => {
                expect(() => new EmergencyFund(1000, 0.5).addPayment(0)).toThrow(new Error('Amount (0) cannot be less than or equal to 0'));
            }),
            it('must return amount if it is paid off', () => {
                const amount = 5000;
                let em = new EmergencyFund(1000,1.0);

                const result = em.addPayment(amount);

                expect(result).toBe(4000);
                expect(em.payments.length).toBe(1);
                expect(em.payments[0].amountRemaining).toBe(0);
                expect(em.payments[0].payment).toBe(1000);
                expect(em.isPaidOff).toBeTrue();
            }),
            it('must handle having previous payments', () => {
                const amount = 100;
                let em = new EmergencyFund(1000, 1.0);
                const firstResult = em.addPayment(amount);

                const secondResult = em.addPayment(amount);

                expect(firstResult).toBe(0);
                expect(secondResult).toBe(0);
                expect(em.payments.length).toBe(2);
                expect(em.payments[0].amountRemaining).toBe(900);
                expect(em.payments[0].payment).toBe(100);
                expect(em.payments[1].amountRemaining).toBe(800);
                expect(em.payments[1].payment).toBe(100);
            })
        })
    }),
    describe('PaymentPlan', () => {
        it('should not have years-to-repay to be less than or equal to 0', () => {
            const loans = [new Loan("Test 1", 1000, 0.1, 10)];
            const years = 0;
            const repaymentStrategy = avalancheRepayment;

            expect(() => new PaymentPlan(loans, years, repaymentStrategy))
            .toThrow(new Error('Years (0) cannot be less than or equal to 0'));
        }),
        describe('getMinimum', () => {
            it('should get the minimum if the interest rate is above the lowest interest rate', () => {
                const ln = new Loan('Test Loan', 1000, 0.1, 10);
                const lnr = new LoanRepayment(ln);
                const years = 6;
                const minimum = getMinimumMonthlyPaymentWithinPeriod(ln.principal, ln.interest, ln.minimum, years);
                const loans = [new Loan("Test 1", 1000, 0.1, 10)];
                const pp = new PaymentPlan(loans, years, avalancheRepayment, undefined, 0.01);

                const result = pp.getMinimum(lnr);

                expect(result).toBeCloseTo(minimum);               
            }),
            it('should get the minimum if the interest rate is equal to the lowest interest rate', () => {
                const ln = new Loan('Test Loan', 1000, 0.1, 10);
                const lnr = new LoanRepayment(ln);
                const years = 6;
                const minimum = getMinimumMonthlyPaymentWithinPeriod(ln.principal, ln.interest, ln.minimum, years);
                const loans = [new Loan("Test 1", 1000, 0.1, 10)];
                const pp = new PaymentPlan(loans, years, avalancheRepayment, undefined, 0.1);

                const result = pp.getMinimum(lnr);

                expect(result).toBeCloseTo(minimum);
            }),
            it('should get the absolute minimum if the interest rate is below the lowest interest rate', () => {
                const ln = new Loan('Test Loan', 1000, 0.1, 10);
                const lnr = new LoanRepayment(ln);
                const years = 6;
                const minimum = getMinimumMonthlyPaymentWithinPeriod(ln.principal, ln.interest, ln.minimum, MAXIMUM_NUMBER_OF_YEARS);
                const loans = [new Loan("Test 1", 1000, 0.1, 10)];
                const pp = new PaymentPlan(loans, years, avalancheRepayment, undefined, 0.2);

                const result = pp.getMinimum(lnr);

                expect(result).toBeCloseTo(minimum);
            })
        }),
        describe('createPlan', () => {

        })
    })
});