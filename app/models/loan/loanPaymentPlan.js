import { Loan } from './loan.js';
import { createPayment, Payment } from './payment.js';

export class LoanPaymentPlan {
    /**
     * Create a loan payment plan
     * @param {Loan} loan 
     * @param {?Payment[]} payments 
     */
    constructor(loan, payments) { 
        this.loan = loan;
        this.payments = payments || [];
    }

    /**
     * Get the minimum payment for this loan
     * @param {Date} dateOfPayment 
     * @returns {Payment}
     */
    getMinimumPayment(dateOfPayment) {
        if(this.payments.length) {
            const lastPayment = this.payments[this.payments.length - 1];
            return lastPayment.getMinimumMonthlyPayment(dateOfPayment);
        } else {
            return createPayment(this.loan, dateOfPayment);
        }
    }

    /**
     * Get the most recent payment for this payment plan
     * @param {Date} dateOfPayment 
     * @returns {Payment}
     */
    getMostRecentPayment(dateOfPayment) {
        if(this.payments.length) {
            const lastPayment = this.payments[this.payments.length - 1];
            return lastPayment;
        } else {
            return createPayment(this.loan, dateOfPayment);
        }
    }
}