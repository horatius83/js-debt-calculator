import { getMinimumMonthlyPaymentWithinPeriod, getPrincipalPlusMonthlyInterest } from "../../app/modules/interest.mjs";
import { 
    avalancheRepayment, 
    snowballRepayment, 
    Loan, 
    LoanRepayment, 
    Payment, 
    EmergencyFund, 
    PaymentPlan,
    MultiplierPaymentPlan
} from "../../app/modules/paymentPlan.mjs";

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
                expect(() => new Payment(0, 100))
                .toThrow(new Error('Paid (0) cannot be less than or equal to 0'));
            })
        }),
        describe('remaining', () => {
            it('should be greater than or equal to 0', () => {
                expect(() => new Payment(100, -1))
                .toThrow(new Error('Remaining (-1) cannot be less than 0'));
            });
        })
    }),
    describe('LoanRepayment', () => {
        it('should calculate minimum payment', () => {
            const ln = new Loan('Test Loan', 1000, 0.1, 10);
            const lnr = new LoanRepayment(ln);
            const years = 6;
            const minimum = getMinimumMonthlyPaymentWithinPeriod(ln.principal, ln.interest / 100.0, ln.minimum, years);

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
                    .map(ln => getMinimumMonthlyPaymentWithinPeriod(ln.principal, ln.interest / 100.0, ln.minimum, years))
                    .reduce((acc, x) => acc + x, 0);
                expect(() => pp.createPlan(0)).toThrow(new Error(`The minimum amount required is $${minimumRequired.toFixed(2)} but contribution amount was $0`));
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
                const contribution = 600;
                const minimumMonthlyPayment = getMinimumMonthlyPaymentWithinPeriod(loans[0].principal, loans[0].interest / 100.0, loans[0].minimum, years);
                const bonus = contribution - minimumMonthlyPayment;
                const pp = new PaymentPlan(loans, years, avalancheRepayment, emergencyFund);

                pp.createPlan(600);

                expect(pp.emergencyFund).toBeDefined();
                expect(pp.emergencyFund?.payments.length).toBe(4);
                expect(pp.emergencyFund?.isPaidOff).toBe(true);
                expect(emergencyFund.payments[0].payment).toBe(bonus / 2.0);
                expect(emergencyFund.payments[3].payment).toBeCloseTo(1000 - (3.0 * bonus / 2.0));
                expect(pp.loanRepayments.length).toBe(1);
                expect(pp.loanRepayments[0].payments.length).toBe(4);
                expect(pp.loanRepayments[0].isPaidOff).toBe(true);
                expect(pp.loanRepayments[0].payments[0].paid).toBe(minimumMonthlyPayment + (bonus / 2.0));
                expect(pp.loanRepayments[0].payments[3].paid).toBe(getPrincipalPlusMonthlyInterest(pp.loanRepayments[0].payments[2].remaining, loans[0].interest / 100.0));
            }),
            it('should roll over payments once one loan is paid off', () => {
                const loans = [
                    new Loan("Test 1", 1000, 0.1, 10),
                    new Loan("Test 2", 2000, 0.2, 20)
                ];
                const years = 6;
                const loanPaymentMinimums = loans.map(x => getMinimumMonthlyPaymentWithinPeriod(x.principal, x.interest / 100.0, x.minimum, years));
                const totalMinimum = loanPaymentMinimums.reduce((acc, x) => acc + x, 0);
                const totalContribution = 1300;
                const bonus = totalContribution - totalMinimum;
                const firstPrincipal = getPrincipalPlusMonthlyInterest(loans[0].principal, loans[0].interest / 100.0);
                const firstPayment = firstPrincipal;
                const remainingBonus = bonus - firstPayment + loanPaymentMinimums[0];
                const secondPrincipal = getPrincipalPlusMonthlyInterest(loans[1].principal, loans[1].interest / 100.0);
                const secondPayment = loanPaymentMinimums[1] + remainingBonus;
                const thirdPrincipal = getPrincipalPlusMonthlyInterest(secondPrincipal - secondPayment, loans[1].interest / 100.0);
                const thirdPayment = totalContribution;
                
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
                expect(pp.loanRepayments[1].payments[1].paid).toBeCloseTo(thirdPayment);
                expect(pp.loanRepayments[1].payments[1].remaining).toBeCloseTo(thirdPrincipal - thirdPayment, PRECISION);
            }),
            it('should add a bonus to the most important loan when principal is less than minimum payment', () => {
                const loans = [
                    new Loan("Test 1", 2000, 0.2, 20),
                    new Loan("Test 2", 5, 0.1, 20)
                ];
                const years = 6;
                const firstMinimum = getMinimumMonthlyPaymentWithinPeriod(loans[0].principal, loans[0].interest / 100.0, loans[0].minimum, years);
                const secondMinimum = getPrincipalPlusMonthlyInterest(loans[1].principal, loans[1].interest / 100.0);
                const loanPaymentMinimums = [firstMinimum, secondMinimum].reduce((acc, x) => acc + x, 0);
                const totalContribution = 1300;
                const bonus = totalContribution - loanPaymentMinimums;
                const firstLoanAmountPaid = firstMinimum + bonus;
                
                const pp = new PaymentPlan(loans, years, avalancheRepayment);
                pp.createPlan(1300);

                expect(pp.loanRepayments.length).toBe(2);
                expect(pp.loanRepayments[0].loan.name).toBe('Test 1');
                expect(pp.loanRepayments[0].payments[0].paid).toBe(firstLoanAmountPaid);
                expect(pp.loanRepayments[0].payments[0].paidMoreThanMinimum).toBe(true);
                expect(pp.loanRepayments[1].loan.name).toBe('Test 2');
                expect(pp.loanRepayments[1].payments[0].paid).toBe(secondMinimum);
                expect(pp.loanRepayments[1].payments[0].remaining).toBe(0);
            })
        }),
        describe('getPaymentPlanSeries', () => {
            it('should produce a generator that has dates, and a series of loan-names and payments', () => {
                const loans = [new Loan("Test 1", 10000, 0.1, 10), new Loan("Test 2", 12000, 0.1, 10)];
                const years = 6;
                const pp = new PaymentPlan(loans, years, avalancheRepayment);
                pp.createPlan(600);

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
                const lps = pp.loanRepayments.reduce((m, x, _, __) => m.set(x.loan.name, x.payments[0]), new Map());
                expect(test1?.paid).toBe(lps.get('Test 1')?.paid);
                const test2 = xs[0].loanPayments.get("Test 2");
                expect(test2).toBeDefined();
                expect(test2?.paid).toBe(lps.get('Test 2')?.paid);
            });
        })
    }),
    describe('MultiplierPaymentPlan', () => {
        describe('createPlan', () => {
            it('should not accept contribution amounts that are too low', () => {
                const loans = [new Loan("Test 1", 1000, 0.1, 10)];
                const years = 6;
                const pp = new MultiplierPaymentPlan(loans, years, avalancheRepayment);
                const minimumRequired = loans
                    .map(ln => getMinimumMonthlyPaymentWithinPeriod(ln.principal, ln.interest / 100.0, ln.minimum, years))
                    .reduce((acc, x) => acc + x, 0);
                expect(() => pp.createPlan(0)).toThrow(new Error(`The minimum amount required is $${minimumRequired.toFixed(2)} but contribution amount was $0`));
            }),
            it('should exit if all loans are paid off', () => {
                const loans = [new Loan("Test 1", 1000, 0.1, 10)];
                const years = 6;
                const pp = new MultiplierPaymentPlan(loans, years, avalancheRepayment);
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
                const pp = new MultiplierPaymentPlan(loans, years, avalancheRepayment);

                pp.createPlan(600);

                expect(pp.emergencyFund).toBeFalsy();
                expect(pp.loanRepayments.length).toBe(1);
                expect(pp.loanRepayments[0].payments.length).toBe(2);
                expect(pp.loanRepayments[0].isPaidOff).toBe(true);
            }),
            it('should pay emergency fund first', () => {
                const loan = new Loan("Test 1", 1000, 10, 10);
                const loans = [loan];
                const years = 6;
                const emergencyFund = new EmergencyFund(1000, 0.5);
                const contribution = 600;
                const minimumPayment = getMinimumMonthlyPaymentWithinPeriod(
                    loan.principal,
                    loan.interest / 100.0,
                    loan.minimum,
                    years
                );
                const totalBonus = contribution - minimumPayment;

                const newPayment = (remainingPrincipal, remainingEmergencyFund) => {
                    const principalPlusInterest = getPrincipalPlusMonthlyInterest(remainingPrincipal, loan.interest / 100.0);
                    const paymentBonus = emergencyFund.percentageOfBonusFunds * totalBonus < remainingEmergencyFund
                        ? (1.0 - emergencyFund.percentageOfBonusFunds) * totalBonus
                        : totalBonus - remainingEmergencyFund;
                    const emergencyFundBonus = emergencyFund.percentageOfBonusFunds * totalBonus < remainingEmergencyFund
                        ? emergencyFund.percentageOfBonusFunds * totalBonus
                        : remainingEmergencyFund;
                    
                    const multiplier = paymentBonus < principalPlusInterest
                        ? Math.floor(paymentBonus / minimumPayment)
                        : 0;
                    const amountPaid = paymentBonus < principalPlusInterest
                        ? minimumPayment * multiplier 
                        : principalPlusInterest;
                    const remaining = principalPlusInterest - amountPaid;

                    return { principalPlusInterest, multiplier, amountPaid, remaining,
                        emergencyFundPaid: emergencyFundBonus,
                        emergencyFundRemaining: remainingEmergencyFund - emergencyFundBonus
                    };
                };

                const payments = [];
                payments[0] = newPayment(loan.principal, emergencyFund.targetAmount);
                payments[1] = newPayment(payments[0].remaining, payments[0].emergencyFundRemaining);
                payments[2] = newPayment(payments[1].remaining, payments[1].emergencyFundRemaining);
                payments[3] = newPayment(payments[2].remaining, payments[2].emergencyFundRemaining);

                const pp = new MultiplierPaymentPlan(loans, years, avalancheRepayment, emergencyFund);
                pp.createPlan(contribution);

                expect(pp.emergencyFund).toBeDefined();
                expect(pp.emergencyFund?.payments.length).toBe(4);
                expect(pp.emergencyFund?.isPaidOff).toBe(true);
                expect(pp.emergencyFund?.payments[0].payment).toBeCloseTo(emergencyFund.percentageOfBonusFunds * totalBonus);
                expect(pp.emergencyFund?.payments[3].payment).toBeCloseTo(emergencyFund.targetAmount - (emergencyFund.percentageOfBonusFunds * totalBonus * 3));
                
                expect(pp.loanRepayments[0].payments.length).toBe(4);
                expect(pp.loanRepayments[0].payments[0].multiplier).toBe(15);
                expect(pp.loanRepayments[0].payments[0].paid).toBeCloseTo(15 * minimumPayment);
            }),
            it('should roll over payments once one loan is paid off', () => {
                const loans = [
                    new Loan("Test 1", 2000, 0.2, 20),
                    new Loan("Test 2", 1000, 0.1, 10)
                ];
                const years = 6;
                const loanPaymentMinimums = loans
                    .map(x => getMinimumMonthlyPaymentWithinPeriod(x.principal, x.interest / 100.0, x.minimum, years));
                const totalMinimum = loanPaymentMinimums
                    .reduce((acc, x) => acc + x, 0);
                const totalContribution = 1300;
                const bonus = totalContribution - totalMinimum;

                const newPayment = (remainingPrincipal, /** @type { Loan } */loan, bonus) => {
                    const principalPlusInterest = getPrincipalPlusMonthlyInterest(remainingPrincipal, loan.interest);
                    const minimum = Math.max(
                        getMinimumMonthlyPaymentWithinPeriod(loan.principal, loan.interest, loan.minimum, years),
                        loan.minimum
                    );
                    const totalBonus = bonus + minimum;
                    if (principalPlusInterest <= minimum) {
                        return { 
                            paymentAmount: principalPlusInterest, 
                            newBonus: totalBonus - principalPlusInterest,
                            newPrincipal: 0,
                            multiplier: 0
                        };
                    }
                    const multiplier = Math.floor(Math.min(totalBonus, principalPlusInterest) / minimum);
                    const paymentAmount = multiplier * minimum;
                    const newBonus = totalBonus - paymentAmount;
                    const newPrincipal = principalPlusInterest - paymentAmount;
                    return { paymentAmount, newBonus, newPrincipal, multiplier };
                };

                const payments = [];
                payments[0] = [];
                payments[0][0] = newPayment(loans[0].principal, loans[0], bonus);
                payments[0][1] = newPayment(loans[1].principal, loans[1], payments[0][0].newBonus);
                payments[1] = [];
                payments[1][0] = newPayment(payments[0][0].newPrincipal, loans[0], bonus);
                payments[1][1] = newPayment(payments[0][1].newPrincipal, loans[1], payments[1][0].newBonus);
                payments[2] = [];
                payments[2][0] = newPayment(payments[1][0].newPrincipal, loans[0], bonus);
                payments[2][1] = newPayment(payments[1][1].newPrincipal, loans[1], payments[2][0].newBonus);
                payments[3] = [];
                payments[3][0] = newPayment(payments[2][0].newPrincipal, loans[0], bonus);
                payments[3][1] = newPayment(payments[2][1].newPrincipal, loans[1], payments[3][0].newBonus);

                const mpp = new MultiplierPaymentPlan(loans, years, avalancheRepayment);
                mpp.createPlan(1300);

                payments.forEach(p => {
                    p.forEach(pp => {
                        console.log(`${JSON.stringify(pp)}`);
                    })
                });

                expect(mpp.loanRepayments[0].payments[0].paid).toBeCloseTo(payments[0][0].paymentAmount);
                expect(mpp.loanRepayments[1].payments[0].paid).toBeCloseTo(payments[0][1].paymentAmount);
            }),
            xit('should add a bonus to the most important loan when principal is less than minimum payment', () => {
                const loans = [
                    new Loan("Test 1", 2000, 0.2, 20),
                    new Loan("Test 2", 5, 0.1, 20)
                ];
                const years = 6;
                const firstMinimum = getMinimumMonthlyPaymentWithinPeriod(loans[0].principal, loans[0].interest / 100.0, loans[0].minimum, years);
                const secondMinimum = getPrincipalPlusMonthlyInterest(loans[1].principal, loans[1].interest / 100.0);
                //const loanPaymentMinimums = [firstMinimum, secondMinimum].reduce((acc, x) => acc + x, 0);
                const totalContribution = firstMinimum + secondMinimum + secondMinimum;
                //const bonus = totalContribution - loanPaymentMinimums;
                //console.log('totalContribution: ', totalContribution);
                //console.log('bonus: ', bonus);
                //console.log('firstMinimum: ', firstMinimum);
                //console.log('secondMinimum: ',secondMinimum);
                const firstLoanAmountPaid = firstMinimum;
                const secondAmountPaid = secondMinimum * 2;
                
                const pp = new MultiplierPaymentPlan(loans, years, avalancheRepayment);
                pp.createPlan(1300);

                expect(pp.loanRepayments.length).toBe(2);
                expect(pp.loanRepayments[0].loan.name).toBe('Test 1');
                expect(pp.loanRepayments[0].payments[0].paid).toBe(firstLoanAmountPaid);
                expect(pp.loanRepayments[0].payments[0].paidMoreThanMinimum).toBe(true);
                expect(pp.loanRepayments[1].loan.name).toBe('Test 2');
                expect(pp.loanRepayments[1].payments[0].paid).toBe(secondAmountPaid);
                expect(pp.loanRepayments[1].payments[0].remaining).toBe(0);
            })
        })
    });
}); 