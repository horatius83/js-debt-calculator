// import { createPayment } from './payment.model';

class LoanPaymentPlan {
    constructor(loan, payments) { 
        this.loan = loan;
        this.payments = payments || [];
    }

    getMinimumPayment(dateOfPayment) {
        if(this.payments.length) {
            const lastPayment = this.payments[this.payments.length - 1];
            return lastPayment.getMinimumMonthlyPayment(dateOfPayment);
        } else {
            return createPayment(this.loan, dateOfPayment);
        }
    }

    getMostRecentPayment(dateOfPayment) {
        if(this.payments.length) {
            const lastPayment = this.payments[this.payments.length - 1];
            return lastPayment;
        } else {
            return createPayment(this.loan, dateOfPayment);
        }
    }
}