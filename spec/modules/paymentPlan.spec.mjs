import { EmergencyFund } from "../../app/modules/emergencyFund.mjs";
import { getMinimumMonthlyPaymentWithinPeriod, getPrincipalPlusMonthlyInterest } from "../../app/modules/interest.mjs";
import { Loan } from "../../app/modules/loan.mjs";
import { LoanRepayment } from "../../app/modules/loanRepayment.mjs";
import { Payment } from "../../app/modules/payment.mjs";
import { avalancheRepayment, snowballRepayment, PaymentPlan } from "../../app/modules/paymentPlan.mjs";
import { moneyFormat, usd, zero } from "../../app/modules/util.mjs";

const PRECISION = 0.01;

/**
 * Check if items are equal and output a helpful error message
 * @param {Dinero.Dinero} actual 
 * @param {Dinero.Dinero} expected 
 */
const eq = (actual, expected) => {
    const actualString = actual ? actual.toFormat(moneyFormat) : 'undefined';
    const expectedString = expected ? expected.toFormat(moneyFormat) : 'undefined';
    const context = `${actualString} should be ${expectedString}`;
    expect(actual).withContext(context).toEqual(expected);
};

describe('paymentPlan', () => {
    beforeEach(function() {
        /**
         * Compare two dinero objects
         * @param {Dinero.Dinero} a 
         * @param {Dinero.Dinero} b 
         */
        const moneyEq = (a, b) => {
            try {
                return a.equalsTo(b);
            } catch {}
        }
        jasmine.addCustomEqualityTester(moneyEq);
    });

    describe('Loan', () => {
        describe('principal', () => {
            it('should be greater than 0', () => {
                expect(() => new Loan('Test', zero, 0.1, usd(10)))
                .toThrow(new Error(`Principal ($0.00) must be greater than $0`));
            })
        }),
        describe('interest', () => {
            it('should be greater than or equal to 0', () => {
                expect(() => new Loan('Test', usd(1000), -1, usd(10)))
                .toThrow(new Error('Interest (-1%) cannot be less than 0%'));
            })
        })
        describe('minimum', () => {
            it('should be greater than 0', () => {
                expect(() => new Loan('Test', usd(1000), 0.1, zero))
                .toThrow(new Error('Minimum ($0.00) must be greater than $0'));
            })
        })
    }),
    describe('Payment', () => {
        describe('paid', () => {
            it('should be greater than 0', () => {
                expect(() => new Payment(zero, usd(100)))
                .toThrow(new Error('Amount paid ($0.00) must be greater than $0'));
            })
        }),
        describe('remaining', () => {
            it('should be greater than or equal to 0', () => {
                expect(() => new Payment(usd(100), usd(-100)))
                .toThrow(new Error('Remaining principal (-$100.00) cannot be less than $0'));
            });
        })
    }),
    describe('LoanRepayment', () => {
        it('should calculate minimum payment', () => {
            const ln = new Loan('Test Loan', usd(1000), 0.1, usd(10));
            const lnr = new LoanRepayment(ln);
            const years = 6;
            const minimum = getMinimumMonthlyPaymentWithinPeriod(ln.principal, ln.interest, ln.minimum, years);

            const result = lnr.getMinimum(years);

            expect(result).toEqual(minimum);
        })
    }),
    describe('avalancheRepayment', () => {
        it('should order loans by interest rate', () => {
            let loans = [1,2,3,4,5]
                .map(x => new Loan(`Test Loan ${x}`, usd(1000), x * 0.1, usd(100)))

            const result = avalancheRepayment(loans);

            expect(result).toBeDefined();
            expect(result.length).toBe(5);
            expect(result[0].interest).toBeCloseTo(5 * 0.1, PRECISION);
        }),
        it('should not modify the input', () => {
            let loans = [1,2,3,4,5].map(x => new Loan(`Test Loan ${x}`, usd(1000), x / 10.0, usd(100)))

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
                .map(x => new Loan(`Test Loan ${x}`, usd(1000 * x), x / 10.0, usd(100)));

            const result = snowballRepayment(loans);

            expect(result).toBeDefined();
            expect(result.length).toBe(5);
            expect(result[0].principal.equalsTo(usd(1000))).toBeTrue();
        }),
        it('should not modify the input', () => {
            let loans = [1,2,3,4,5]
                .reverse()
                .map(x => new Loan(`Test Loan ${x}`, usd(1000 * x), x / 10.0, usd(100)));

            const result = snowballRepayment(loans);

          expect(loans[0].principal.equalsTo(usd(5000))).toBeTrue();
          expect(result[0].principal.equalsTo(usd(1000))).toBeTrue();
        }),
        it('should handle empty arrays', () => {
            const result = snowballRepayment([]);

            expect(result).toBeDefined();
            expect(result.length).toBe(0);
        })
    }),
    describe('PaymentPlan', () => {
        it('should not have years-to-repay to be less than or equal to 0', () => {
            const loans = [new Loan("Test 1", usd(1000), 0.1, usd(10))];
            const years = 0;
            const repaymentStrategy = avalancheRepayment;

            expect(() => new PaymentPlan(loans, years, repaymentStrategy))
            .toThrow(new Error('Years (0) must be greater than 0'));
        }),
        describe('createPlan', () => {
            it('should not accept contribution amounts that are too low', () => {
                const loans = [new Loan("Test 1", usd(1000), 0.1, usd(10))];
                const years = 6;
                const pp = new PaymentPlan(loans, years, avalancheRepayment);
                const minimumRequired = loans
                    .map(ln => getMinimumMonthlyPaymentWithinPeriod(ln.principal, ln.interest, ln.minimum, years))
                    .reduce((acc, x) => acc.add(x), zero);
                expect(() => pp.createPlan(zero))
                .toThrow(new Error(`The minimum amount required is ${minimumRequired.toFormat(moneyFormat)} but contribution amount was $0.00`));
            }),
            it('should exit if all loans are paid off', () => {
                const loans = [new Loan("Test 1", usd(1000), 0.1, usd(10))];
                const years = 6;
                const pp = new PaymentPlan(loans, years, avalancheRepayment);
                pp.loanRepayments[0].isPaidOff = true;
                const minimumRequired = loans
                    .map(ln => getMinimumMonthlyPaymentWithinPeriod(ln.principal, ln.interest, ln.minimum, years))
                    .reduce((acc, x) => acc.add(x), zero);

                pp.createPlan(minimumRequired);

                expect(pp.loanRepayments).toBeDefined();
                expect(pp.loanRepayments.length).toBe(1);
                expect(pp.loanRepayments[0].payments.length).toBe(0);
                expect(pp.loanRepayments[0].isPaidOff).toBe(true);
            }),
            it('should handle not having an emergency fund', () => {
                const loans = [new Loan("Test 1", usd(1000), 0.1, usd(10))];
                const years = 6;
                const pp = new PaymentPlan(loans, years, avalancheRepayment);

                pp.createPlan(usd(600));

                expect(pp.emergencyFund).toBeFalsy();
                expect(pp.loanRepayments.length).toBe(1);
                expect(pp.loanRepayments[0].payments.length).toBe(2);
                expect(pp.loanRepayments[0].isPaidOff).toBe(true);
            }),
            it('should pay emergency fund first', () => {
                const loans = [new Loan("Test 1", usd(1000), 0.1, usd(10))];
                const years = 6;
                const emergencyFund = new EmergencyFund(usd(1000), 0.5);
                const contribution = usd(600);
                const minimumMonthlyPayment = getMinimumMonthlyPaymentWithinPeriod(loans[0].principal, loans[0].interest, loans[0].minimum, years);
                const bonus = contribution.subtract(minimumMonthlyPayment);
                const pp = new PaymentPlan(loans, years, avalancheRepayment, emergencyFund);

                pp.createPlan(usd(600));

                expect(pp.emergencyFund).toBeDefined();
                expect(pp.emergencyFund?.payments.length).toBe(4);
                expect(pp.emergencyFund?.isPaidOff).toBe(true);
                eq(emergencyFund.payments[0].payment, bonus.divide(2));
                //expect(emergencyFund.payments[3].payment).toBe(1000 - (3.0 * bonus / 2.0));
                eq(emergencyFund.payments[3].payment, usd(1000).subtract(bonus.multiply(3).divide(2)));
                expect(pp.loanRepayments.length).toBe(1);
                expect(pp.loanRepayments[0].payments.length).toBe(4);
                expect(pp.loanRepayments[0].isPaidOff).toBe(true);
                //expect(pp.loanRepayments[0].payments[0].paid).toBe(minimumMonthlyPayment + (bonus / 2.0));
                eq(pp.loanRepayments[0].payments[0].paid, minimumMonthlyPayment.add(bonus.divide(2)));
                expect(pp.loanRepayments[0].payments[3].paid.equalsTo(
                    getPrincipalPlusMonthlyInterest(pp.loanRepayments[0].payments[2].remaining, loans[0].interest)))
                .toBeTrue();
            }),
            it('should roll over payments once one loan is paid off', () => {
                const loans = [
                    new Loan("Test 1", usd(1000), 0.1, usd(10)),
                    new Loan("Test 2", usd(2000), 0.2, usd(20))
                ];
                const years = 6;
                const loanPaymentMinimums = loans.map(x => getMinimumMonthlyPaymentWithinPeriod(x.principal, x.interest, x.minimum, years));
                const totalMinimum = loanPaymentMinimums.reduce((acc, x) => acc.add(x), zero);
                const totalContribution = usd(1300);
                const bonus = totalContribution.subtract(totalMinimum);
                const firstPrincipal = getPrincipalPlusMonthlyInterest(loans[0].principal, loans[0].interest);
                const firstPayment = firstPrincipal;
                const remainingBonus = bonus.subtract(firstPayment).add(loanPaymentMinimums[0]);
                const secondPrincipal = getPrincipalPlusMonthlyInterest(loans[1].principal, loans[1].interest);
                const secondPayment = loanPaymentMinimums[1].add(remainingBonus);
                const thirdPrincipal = getPrincipalPlusMonthlyInterest(secondPrincipal.subtract(secondPayment), loans[1].interest);
                const thirdPayment = totalContribution;
                
                const pp = new PaymentPlan(loans, years, snowballRepayment);

                pp.createPlan(usd(1300));

                expect(pp.loanRepayments.length).toBe(2);
                expect(pp.loanRepayments[0].loan.name).toBe('Test 1');
                expect(pp.loanRepayments[0].payments.length).toBe(1);
                expect(pp.loanRepayments[0].payments[0].paid.equalsTo(firstPrincipal)).toBeTrue();
                expect(pp.loanRepayments[0].payments[0].remaining.equalsTo(zero)).toBeTrue();
                expect(pp.loanRepayments[0].isPaidOff).toBe(true);
                expect(pp.loanRepayments[1].loan.name).toBe('Test 2');
                expect(pp.loanRepayments[1].payments.length).toBe(3);
                expect(pp.loanRepayments[1].payments[0].paid).toEqual(secondPayment);
                expect(pp.loanRepayments[1].payments[0].remaining)
                .toEqual(secondPrincipal.subtract(secondPayment));
                expect(pp.loanRepayments[1].payments[1].paid).toEqual(thirdPayment);
                expect(pp.loanRepayments[1].payments[1].remaining)
                .toEqual(thirdPrincipal.subtract(thirdPayment));
            }),
            it('should add a bonus to the most important loan when principal is less than minimum payment', () => {
                const loans = [
                    new Loan("Test 1", usd(2000), 0.2, usd(20)),
                    new Loan("Test 2", usd(5), 0.1, usd(20))
                ];
                const years = 6;
                const firstMinimum = getMinimumMonthlyPaymentWithinPeriod(loans[0].principal, loans[0].interest, loans[0].minimum, years);
                const secondMinimum = getPrincipalPlusMonthlyInterest(loans[1].principal, loans[1].interest);
                const loanPaymentMinimums = [firstMinimum, secondMinimum].reduce((acc, x) => acc.add(x), zero);
                const totalContribution = usd(1300);
                const bonus = totalContribution.subtract(loanPaymentMinimums);
                const firstLoanAmountPaid = firstMinimum.add(bonus);
                
                const pp = new PaymentPlan(loans, years, avalancheRepayment);
                pp.createPlan(usd(1300));
                
                expect(pp.loanRepayments.length).toBe(2);
                expect(pp.loanRepayments[0].loan.name).toBe('Test 1');
                eq(pp.loanRepayments[0].payments[0].paid, firstLoanAmountPaid);
                expect(pp.loanRepayments[0].payments[0].paidMoreThanMinimum).toBe(true);
                expect(pp.loanRepayments[1].loan.name).toBe('Test 2');
                eq(pp.loanRepayments[1].payments[0].paid, secondMinimum);
                expect(pp.loanRepayments[1].payments[0].remaining).toEqual(zero);
            })
        }),
        describe('getPaymentPlanSeries', () => {
            it('should produce a generator that has dates, and a series of loan-names and payments', () => {
                const loans = [new Loan("Test 1", usd(10000), 0.1, usd(10)), new Loan("Test 2", usd(12000), 0.1, usd(10))];
                const years = 6;
                const pp = new PaymentPlan(loans, years, avalancheRepayment);
                pp.createPlan(usd(600));

                const g = pp.getPaymentPlanSeries(new Date(1970, 0, 1));

                const xs = Array.from(g);
                expect(xs[0].month).toBe("January 1970");
                expect(xs[12].month).toBe("January 1971");

                const entries = Array.from(xs[0].loanPayments.entries());
                expect(entries.length).toBe(2);
                expect(xs[0].loanPayments.has("Test 1")).toBeTrue();
                expect(xs[0].loanPayments.has("Test 2")).toBeTrue();
                const test1 = xs[0].loanPayments.get("Test 1");
                expect(test1).toBeDefined();
                /** @type { Map<string, Payment> } */
                const lps = pp.loanRepayments.reduce((m, x, _, __) => m.set(x.loan.name, x.payments[0])
                , new Map());
                eq(test1?.paid, lps.get('Test 1')?.paid);
                const test2 = xs[0].loanPayments.get("Test 2");
                expect(test2).toBeDefined();
                eq(test2?.paid, lps.get('Test 2')?.paid);
            });
        })
    })
}); 