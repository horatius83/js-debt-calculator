import { Payment } from './payment.mjs';
import { EmergencyFundPayment } from './emergencyFundPayment.mjs';

export class PaymentPlanOutputMonth {
    /**
     * Summary of payments for a given month
     * @param {string} month - what month this took place
     * @param {Map<string, Payment>} loanPayments - payments that took place this month
     * @param {EmergencyFundPayment=} emergencyFundPayment - payment to Emergency Fund (if any)
     */
    constructor(month, loanPayments, emergencyFundPayment) {
        this.month = month;
        this.loanPayments = loanPayments;
        this.emergencyFundPayment = emergencyFundPayment
    }
}