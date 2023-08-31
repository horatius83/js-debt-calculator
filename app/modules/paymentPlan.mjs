import { Loan } from './loan.mjs';
import { getMinimumMonthlyPaymentWithinPeriod } from './interest.mjs';

export class Payment {
    /**
     * Represents a payment on a loan
     * @param {number} paid 
     * @param {number} remaining 
     * @param {boolean} isDoubled 
     */
    constructor(paid, remaining, isDoubled) {
        this.paid = paid;
        this.remaining = remaining;
        this.isDoubled = isDoubled;
    }
}

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
     */
    getMinimum = (years) =>
        getMinimumMonthlyPaymentWithinPeriod(this.loan.principal, this.loan.interest, this.loan.minimum, years);

    /**
     * Add a payment to this loan repayment plan
     * @param {number} amount - the amount available to pay on this loan
     * @param {boolean=} isDoubled - is this a doubled payment
     * @returns {number} leftover money if this loan is paid off
     */
    makePayment(amount, isDoubled = false) {
        if (this.isPaidOff) {
            return amount;
        }
        const principalRemaining = this.payments.at(-1)?.remaining ?? this.loan.principal;
        /**
         * 
         * @returns {[number, Payment]}
         */
        const createPayment = () => {
            if (principalRemaining > amount) {
                return [0, new Payment(amount, principalRemaining - amount, isDoubled)];
            } else {
                const amountRemaining = amount - principalRemaining;
                this.isPaidOff = true;
                return [amountRemaining, new Payment(principalRemaining, 0, isDoubled)]
            }
        }
        const [remainder, payment] = createPayment();
        this.payments.push(payment);
        return remainder;
    }
}

export class PaymentPlan {
    /**
     * A class represnting a plan to repay a group of loans
     * @param {Loan[]} loans - the loans to repay
     * @param {number} years - the maximum number of years to repay those loans
     */
    constructor(loans, years) {
        this.loanRepayments = loans.map(ln => new LoanRepayment(ln));
        this.years = years;
    }

    /**
     * Create a plan to pay down a series of loans
     * @param {number} contributionAmount - the maximum amount of money that can be contributed to paying down the debt
     */
    createPlan(contributionAmount) {
        const minimumRequired = this.loanRepayments
            .map(lr => lr.getMinimum(this.years))
            .reduce((acc, x) => acc + x, 0);
        if (contributionAmount < minimumRequired) {
            throw new Error(`The minimum amount required is ${minimumRequired}`);
        }
    }
}

// sort items