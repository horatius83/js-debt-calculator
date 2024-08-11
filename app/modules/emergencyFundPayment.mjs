
import Dinero from 'dinero.js';
import { zero } from './util.mjs';

export class EmergencyFundPayment {
    /**
     * A individual payment toward an emergency fund
     * @param { Dinero.Dinero } payment 
     * @param { Dinero.Dinero } amountRemaining 
     */
    constructor(payment, amountRemaining) {
        if (payment.lessThanOrEqual(zero)) {
            throw new Error(`Payment must be greater than 0`);
        }
        this.payment = payment;
        if (amountRemaining.lessThan(zero)) {
            throw new Error(`Amount remaining must be greater than or equal to zero`);
        }
        this.amountRemaining = amountRemaining;
    }
}