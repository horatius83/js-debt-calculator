
import Dinero from 'dinero.js';
import { zero } from './util.mjs';

export class EmergencyFundPayment {
    /**
     * A individual payment toward an emergency fund
     * @param { Dinero.Dinero } payment 
     * @param { Dinero.Dinero } amountRemaining 
     */
    constructor(payment, amountRemaining) {
        if (payment.lessThan(zero)) {
            throw new Error(`Payment cannot be less than zero`);
        }
        this.payment = payment;
        if (amountRemaining.lessThan(zero)) {
            throw new Error(`Amount remaining must be greater than or equal to zero`);
        }
        this.amountRemaining = amountRemaining;
    }
}