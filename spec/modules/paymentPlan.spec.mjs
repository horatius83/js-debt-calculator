import { getMinimumMonthlyPaymentWithinPeriod, getPrincipalPlusMonthlyInterest } from "../../app/modules/interest.mjs";
import { avalancheRepayment, snowballRepayment, Loan, LoanRepayment, Payment, EmergencyFund, PaymentPlan, MAXIMUM_NUMBER_OF_YEARS } from "../../app/modules/paymentPlan.mjs";

const PRECISION = 0.01;

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

            expect(result).toBeCloseTo(minimum, PRECISION);
        })
    }),
    describe('avalancheRepayment', () => {
        it('should order loans by interest rate', () => {
            let loans = [1,2,3,4,5]
                .map(x => new Loan(`Test Loan ${x}`, 1000, x * 0.1, 100))

            const result = avalancheRepayment(loans);

            expect(result).toBeDefined();
            expect(result.length).toBe(5);
            expect(result[0].interest).toBeCloseTo(5 * 0.1, PRECISION);
        }),
        it('should not modify the input', () => {
            let loans = [1,2,3,4,5].map(x => new Loan(`Test Loan ${x}`, 1000, x / 10.0, 100))

            const result = avalancheRepayment(loans);

            expect(loans[0].interest).toBeCloseTo(0.1, PRECISION);
            expect(result[0].interest).toBeCloseTo(0.5, PRECISION);
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
            expect(result[0].principal).toBeCloseTo(1000, PRECISION);
        }),
        it('should not modify the input', () => {
            let loans = [1,2,3,4,5]
                .reverse()
                .map(x => new Loan(`Test Loan ${x}`, 1000 * x, x / 10.0, 100));

            const result = snowballRepayment(loans);

            expect(loans[0].principal).toBeCloseTo(5000, PRECISION);
            expect(result[0].principal).toBeCloseTo(1000, PRECISION);
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
                expect(em.payments[0].payment).toBeCloseTo(1000, PRECISION);
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
                expect(em.payments[0].amountRemaining).toBeCloseTo(900, PRECISION);
                expect(em.payments[0].payment).toBeCloseTo(100, PRECISION);
                expect(em.payments[1].amountRemaining).toBeCloseTo(800, PRECISION);
                expect(em.payments[1].payment).toBeCloseTo(100, PRECISION);
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
        describe('createPlan', () => {
            it('should not accept contribution amounts that are too low', () => {
                const loans = [new Loan("Test 1", 1000, 0.1, 10)];
                const years = 6;
                const pp = new PaymentPlan(loans, years, avalancheRepayment);
                const minimumRequired = loans
                    .map(ln => getMinimumMonthlyPaymentWithinPeriod(ln.principal, ln.interest, ln.minimum, years))
                    .reduce((acc, x) => acc + x, 0);
                expect(() => pp.createPlan(0)).toThrow(new Error(`The minimum amount required is $${minimumRequired.toFixed(2)}`));
            }),
            it('should exit if all loans are paid off', () => {
                const loans = [new Loan("Test 1", 1000, 0.1, 10)];
                const years = 6;
                const pp = new PaymentPlan(loans, years, avalancheRepayment);
                pp.loanRepayments[0].isPaidOff = true;
                const minimumRequired = loans
                    .map(ln => getMinimumMonthlyPaymentWithinPeriod(ln.principal, ln.interest, ln.minimum, years))
                    .reduce((acc, x) => acc + x, 0);

                pp.createPlan(minimumRequired);

                expect(pp.loanRepayments).toBeDefined();
                expect(pp.loanRepayments.length).toBe(1);
                expect(pp.loanRepayments[0].payments.length).toBe(0);
                expect(pp.loanRepayments[0].isPaidOff).toBe(true);
            }),
            it('should handle not having an emergency fund', () => {
                const loans = [new Loan("Test 1", 1000, 0.1, 10)];
                const years = 6;
                const pp = new PaymentPlan(loans, years, avalancheRepayment);

                pp.createPlan(600);

                expect(pp.emergencyFund).toBeFalsy();
                expect(pp.loanRepayments.length).toBe(1);
                expect(pp.loanRepayments[0].payments.length).toBe(2);
                expect(pp.loanRepayments[0].isPaidOff).toBe(true);
            }),
            it('should pay emergency fund first', () => {
                const loans = [new Loan("Test 1", 1000, 0.1, 10)];
                const years = 6;
                const emergencyFund = new EmergencyFund(1000, 0.5);
                const pp = new PaymentPlan(loans, years, avalancheRepayment, emergencyFund);

                pp.createPlan(600);

                expect(pp.emergencyFund).toBeDefined();
                expect(pp.emergencyFund?.payments.length).toBe(4);
                expect(pp.emergencyFund?.isPaidOff).toBe(true);
                expect(pp.loanRepayments.length).toBe(1);
                expect(pp.loanRepayments[0].payments.length).toBe(4);
                expect(pp.loanRepayments[0].isPaidOff).toBe(true);
            }),
            it('should roll over payments once one loan is paid off', () => {
                const loans = [
                    new Loan("Test 1", 1000, 0.1, 10),
                    new Loan("Test 2", 2000, 0.2, 20)
                ];
                const years = 6;
                const loanPaymentMinimums = loans.map(x => getMinimumMonthlyPaymentWithinPeriod(x.principal, x.interest, x.minimum, years));
                const totalMinimum = loanPaymentMinimums.reduce((acc, x) => acc + x, 0);
                const totalContribution = 1300;
                const bonus = totalContribution - totalMinimum;
                const firstPrincipal = getPrincipalPlusMonthlyInterest(loans[0].principal, loans[0].interest);
                const firstPayment = firstPrincipal;
                const remainingBonus = bonus - firstPayment + loanPaymentMinimums[0];
                const secondPrincipal = getPrincipalPlusMonthlyInterest(loans[1].principal, loans[1].interest);
                const secondPayment = loanPaymentMinimums[1] + remainingBonus;
                
                const pp = new PaymentPlan(loans, years, snowballRepayment);

                pp.createPlan(1300);

                expect(pp.loanRepayments.length).toBe(2);
                expect(pp.loanRepayments[0].loan.name).toBe('Test 1');
                expect(pp.loanRepayments[0].payments.length).toBe(1);
                expect(pp.loanRepayments[0].payments[0].paid).toBeCloseTo(firstPrincipal, PRECISION);
                expect(pp.loanRepayments[0].payments[0].remaining).toBe(0);
                expect(pp.loanRepayments[0].isPaidOff).toBe(true);
                expect(pp.loanRepayments[1].loan.name).toBe('Test 2');
                expect(pp.loanRepayments[1].payments.length).toBe(3);
                expect(pp.loanRepayments[1].payments[0].paid).toBeCloseTo(secondPayment, PRECISION);
                expect(pp.loanRepayments[1].payments[0].remaining).toBeCloseTo(secondPrincipal - secondPayment, PRECISION);
            }),
            it('should roll over payments once the emergency fund is paid off', () => {

            })
        })
    })
});