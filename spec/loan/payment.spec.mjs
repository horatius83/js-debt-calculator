import { Payment, createPayment } from '../../app/models/loan/payment.mjs';
import { getMinimumMonthlyPayment, calculateNewPrincipalForMonth } from '../../app/models/util/interest.mjs';
import { Loan } from '../../app/models/loan/loan.mjs';

describe('payment', () => {
    it('should instantiate', () => {
        const loan = new Loan('test loan', 5000, 10, 50);
        const principal = 4000.0;
        const amountPaid = 40.0;
        const dateOfPayment = new Date(2017, 6, 26);

        let payment = new Payment(loan, principal, amountPaid, dateOfPayment);

        expect(payment).toBeTruthy();
        expect(payment.loan).toBe(loan);
        expect(payment.principal).toBeCloseTo(principal);
        expect(payment.amountPaid).toBeCloseTo(amountPaid);
        expect(payment.dateOfPayment).toEqual(dateOfPayment);
    });
    describe('getMinimumMonthlyPayment', () => {
        it('should get the minimum payment monthly payment', () => {
            const loan = new Loan('test loan', 5000, 10, 50);
            const minimum = getMinimumMonthlyPayment(loan.principal, loan.interest, loan.minimum);
            const newPrincipal = calculateNewPrincipalForMonth(loan.principal, loan.interest);
            const payment = new Payment(loan, loan.principal, 0, new Date(2019,0,22));
            const newDate = new Date(2019,1,22);

            const newPayment = payment.getMinimumMonthlyPayment(newDate);

            expect(newPayment.loan).toBe(loan);
            expect(newPayment.amountPaid).toBe(minimum);
            expect(newPayment.dateOfPayment).toBe(newDate);
            expect(newPayment.principal).toBe(newPrincipal - minimum);
            expect(newPayment.wasDoubled).toBeFalsy();
        });
        it('should not createa a payment greater than the principal', () => {
            const loan = new Loan('test loan', 5000, 10, 5050);
            const newPrincipal = calculateNewPrincipalForMonth(loan.principal, loan.interest);
            const payment = new Payment(loan, loan.principal, 0, new Date(2019,0,22));
            const newDate = new Date(2019,1,22);

            const newPayment = payment.getMinimumMonthlyPayment(newDate);

            expect(newPayment.loan).toBe(loan);
            expect(newPayment.amountPaid).toBeCloseTo(newPrincipal);
            expect(newPayment.dateOfPayment).toBe(newDate);
            expect(newPayment.principal).toBe(0);
            expect(newPayment.wasDoubled).toBeFalsy();
        });
    });
    describe('createBonusMoneyPayment', () => {
        it('should create bonus money payment if the bonus money is greater than the principal', () => {
            const loan = new Loan('test loan', 5000, 10, 5050);
            const paymentDate = new Date(2019,0,22);
            const payment = new Payment(loan, loan.principal, 0, paymentDate);
            const extraMoney = 6000;

            const [newPayment, remainingMoney] = payment.createBonusMoneyPayment(extraMoney);

            expect(newPayment.amountPaid).toBeCloseTo(5000);
            expect(newPayment.dateOfPayment).toBe(paymentDate);
            expect(newPayment.loan).toBe(loan);
            expect(newPayment.principal).toBe(0);
            expect(newPayment.wasDoubled).toBeFalsy();
            expect(remainingMoney).toBeCloseTo(1000);
        });
        it('should create bonus money payment if the bonus money is less than the principal', () => {
            const loan = new Loan('test loan', 5000, 10, 5050);
            const paymentDate = new Date(2019,0,22);
            const payment = new Payment(loan, loan.principal, 0, paymentDate);
            const extraMoney = 1000;

            const [newPayment, remainingMoney] = payment.createBonusMoneyPayment(extraMoney);

            expect(newPayment.amountPaid).toBeCloseTo(1000);
            expect(newPayment.dateOfPayment).toBe(paymentDate);
            expect(newPayment.loan).toBe(loan);
            expect(newPayment.principal).toBe(4000);
            expect(newPayment.wasDoubled).toBeFalsy();
            expect(remainingMoney).toBeCloseTo(0);
        });
    });
    describe('createPayment', () => {
        it('should calculate correctly', () => {
            const loan = new Loan('test loan', 5000, 10, 5050);
            const minimumPayment = loan.getMinimumPayment();
            const newPrincipal = calculateNewPrincipalForMonth(loan.principal, loan.interest);
            const dateOfPayment = new Date(1954, 10, 7);
            
            const payment = createPayment(loan, dateOfPayment);

            expect(payment).toBeDefined();
            expect(payment.amountPaid).toBeCloseTo(minimumPayment);
            expect(payment.dateOfPayment).toBe(dateOfPayment);
            expect(payment.loan).toBe(loan);
            expect(payment.principal).toBeCloseTo(newPrincipal - minimumPayment);
            expect(payment.wasDoubled).toBeFalsy();
        })
    });
});
