import Dinero from 'dinero.js'
import { zero } from './util.mjs'

export class Payment {
    /**
     * Represents a payment on a loan
     * @param {Dinero.Dinero} paid - how much was paid
     * @param {Dinero.Dinero} remaining - principal remaining
     * @param {number=} multiplier - multiplier (2 = 200% payment, 3 = 300% etc.)
     * @param {boolean=} paidMoreThanMinimum - user paid more than the minimum required
     * @param {boolean=} paidOffLoan - user paid this loan off
     */
    constructor(paid, remaining, multiplier, paidMoreThanMinimum = false, paidOffLoan = false) {
        if (paid.lessThanOrEqual(zero)) {
            throw new Error(`Amount paid cannot be less than or equal to 0`);
        }
        this.paid = paid;
        if (remaining.lessThan(zero)) {
            throw new Error(`Remaining principal cannot be less than 0`);
        }
        this.remaining = remaining;
        this.multiplier = multiplier;
        this.paidMoreThanMinimum = paidMoreThanMinimum;
        this.paidOffLoan = paidOffLoan
    }
}