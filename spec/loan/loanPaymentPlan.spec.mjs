import { Loan } from '../../app/models/loan/loan.mjs';
import { LoanPaymentPlan } from '../../app/models/loan/loanPaymentPlan.mjs';
import { calculateNewPrincipalForMonth } from '../../app/models/util/interest.mjs';
import { Payment, createPayment } from '../../app/models/loan/payment.mjs';

describe('loan payment plan model', () => {
    describe('getMinimumPayment', () => {
        it('should create a new minimum payment if none is found', () => {
            const loan = new Loan('test loan', 5000, 10, 50);
            const dateOfPayment = new Date(2017,6,26);
            const loanPaymentPlan = new LoanPaymentPlan(loan);
            expect(loanPaymentPlan.payments.length).toBe(0);
            const expectedMinimumPayment = loan.getMinimumPayment();
            const newPrincipal = calculateNewPrincipalForMonth(loan.principal, loan.interest);

            const newPayment = loanPaymentPlan.getMinimumPayment(dateOfPayment);

            expect(newPayment).toBeDefined();
            expect(newPayment.loan).toBe(loan);
            expect(newPayment.principal).toBeCloseTo(newPrincipal - expectedMinimumPayment);
            expect(newPayment.amountPaid).toBeCloseTo(expectedMinimumPayment);
            expect(newPayment.wasDoubled).toBeFalsy();
        });
        it('should get the last payment and return the minimum payment of that', () => {
            const loan = new Loan('test loan', 5000, 10, 50);
            const minimumPayment = loan.getMinimumPayment();
            const newPrincipal = calculateNewPrincipalForMonth(loan.principal, loan.interest);
            const dateOfPayment = new Date(1983, 8, 3);
            const payment = new Payment(loan, newPrincipal, minimumPayment, dateOfPayment);
            const loanPaymentPlan = new LoanPaymentPlan(loan, [payment]);
            const newDateOfPayment = new Date(1985, 5, 6);
            const expectedPayment = payment.getMinimumMonthlyPayment(newDateOfPayment);

            const newMinimumPayment = loanPaymentPlan.getMinimumPayment(newDateOfPayment);

            expect(newMinimumPayment).toBeDefined();
            expect(newMinimumPayment.amountPaid).toBeCloseTo(expectedPayment.amountPaid);
            expect(newMinimumPayment.dateOfPayment).toBe(newDateOfPayment);
            expect(newMinimumPayment.loan).toBe(loan);
            expect(newMinimumPayment.principal).toBeCloseTo(expectedPayment.principal);
            expect(newMinimumPayment.wasDoubled).toBeFalsy();
        });
    });
    describe('getMostRecentPayment', () => {
        it('should create a new minimum payment if none is found', () => {
            const loan = new Loan('test loan', 5000, 10, 50);
            const loanPaymentPlan = new LoanPaymentPlan(loan);
            const newDateOfPayment = new Date(1985, 5, 6);
            const expectedPayment = createPayment(loan, newDateOfPayment);

            const newMinimumPayment = loanPaymentPlan.getMinimumPayment(newDateOfPayment);

            expect(newMinimumPayment).toBeDefined();
            expect(newMinimumPayment.amountPaid).toBeCloseTo(expectedPayment.amountPaid);
            expect(newMinimumPayment.dateOfPayment).toBe(newDateOfPayment);
            expect(newMinimumPayment.loan).toBe(loan);
            expect(newMinimumPayment.principal).toBeCloseTo(expectedPayment.principal);
            expect(newMinimumPayment.wasDoubled).toBeFalsy();
        });
        it('should get the last payment if there are payments', () => {
            const loan = new Loan('test loan', 5000, 10, 50);
            const dateOfPayment = new Date(1983, 8, 3);
            const payment = createPayment(loan, dateOfPayment);
            const loanPaymentPlan = new LoanPaymentPlan(loan, [payment]);

            const mostRecentPayment = loanPaymentPlan.getMostRecentPayment(dateOfPayment);

            expect(mostRecentPayment).toBeDefined();
            expect(mostRecentPayment.amountPaid).toBeCloseTo(payment.amountPaid);
            expect(mostRecentPayment.dateOfPayment).toBe(dateOfPayment);
            expect(mostRecentPayment.loan).toBe(loan);
            expect(mostRecentPayment.principal).toBeCloseTo(payment.principal);
            expect(mostRecentPayment.wasDoubled).toBe(payment.wasDoubled);
        });
    });
});