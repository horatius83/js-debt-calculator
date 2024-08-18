import Dinero from 'dinero.js'
import { moneyFormat, zero } from './util.mjs'

export class Loan {
    /**
     * Class representing an amount of money owed
     * @param {string} name - the name of the loan
     * @param {Dinero.Dinero} principal - the principal of the loan
     * @param {number} interest - the interest (APR)
     * @param {Dinero.Dinero} minimum - the minimum payment
     */
    constructor(name, principal, interest, minimum) {
        this.name = name;
        if (principal.lessThanOrEqual(zero)) {
            throw new Error(`Principal (${principal.toFormat(moneyFormat)}) must be greater than $0`);
        }
        this.principal = principal;
        if (interest < 0) {
            throw new Error(`Interest (${interest}%) cannot be less than 0%`);
        }
        this.interest = interest;
        if (minimum.lessThanOrEqual(zero)) {
            throw new Error(`Minimum (${minimum.toFormat(moneyFormat)}) must be greater than $0`);
        }
        this.minimum = minimum;
    }
}