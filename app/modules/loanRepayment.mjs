import { Loan } from './loan.mjs'
import { Payment } from './payment.mjs';
import { getMinimumMonthlyPaymentWithinPeriod, getPrincipalPlusMonthlyInterest } from './interest.mjs';

export class LoanRepayment {
    /**
     * A class representing the payments to pay off a loan
     * @param {Loan} loan - the loan to create the repayment for
     */
    constructor(loan) {
        this.loan = loan;
        /** @type { Payment[] } */
        this.payments = [];
        this.isPaidOff = false;
    }

    /**
     * Get the minimum payment needed to pay back loan
     * @param {number} years - the maximum number of years to pay back loan
     * @returns {number} - the minimum payment
     */
    getMinimum = (years) => {
        if (years <= 0) {
            throw new Error(`Years must be greater than 0`);
        }
        const minimum = getMinimumMonthlyPaymentWithinPeriod(this.loan.principal, this.loan.interest / 100.0, this.loan.minimum, years);
        if (this.payments.length) { // Scenario: this is our last payment, the amount remaining is less than the minimum
            const remaining = this.payments?.at(-1)?.remaining || minimum;
            const remainingPlusInterest = getPrincipalPlusMonthlyInterest(remaining, this.loan.interest / 100.0);
            if (remainingPlusInterest < minimum) {
                return remainingPlusInterest;
            }
        } else if (this.loan.principal < minimum) { // Scenario: this is our first payment, but (somehow) the principal is less than the minimum
            const principalPlusInterest = getPrincipalPlusMonthlyInterest(this.loan.principal, this.loan.interest / 100.0);
            if (principalPlusInterest < minimum) {
                return principalPlusInterest;
            }
        }
        return minimum;
    }

    /**
     * Add a payment to this loan repayment plan
     * @param {number} amount - the amount available to pay on this loan
     * @param {number=} multiplier - is this a doubled / tripled / etc. payment
     * @param {boolean=} paidMoreThanMinimum - is this payment more than the minimum required
     * @returns {number} leftover money if this loan is paid off
     */
    makePayment(amount, multiplier, paidMoreThanMinimum) {
        mustBeGreaterThan0(amount, 'Amount');
        if (this.isPaidOff) {
            return amount;
        }
        const principalRemaining = this.payments.at(-1)?.remaining ?? this.loan.principal;
        const newPrincipal = getPrincipalPlusMonthlyInterest(principalRemaining, this.loan.interest / 100.0);
        /**
         * Create a new loan payment
         * @returns {[number, Payment]} - the amount remaining and the Payment to add
         */
        const createPayment = () => {
            if (newPrincipal > amount) {
                return [0, new Payment(amount, newPrincipal - amount, multiplier, paidMoreThanMinimum, false)];
            } else {
                const amountRemaining = amount - newPrincipal;
                this.isPaidOff = true;
                return [amountRemaining, new Payment(newPrincipal, 0, multiplier, paidMoreThanMinimum, true)]
            }
        }
        const [remainder, payment] = createPayment();
        this.payments.push(payment);
        return remainder;
    }
}