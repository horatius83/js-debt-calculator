import { getMinimumMonthlyPayment } from '../util/interest.mjs';

class Loan {
    /**
     * Class representing a loan
     * @param {string} name 
     * @param {number} principal 
     * @param {number} interest 
     * @param {number} minimum 
     */
    constructor(
        name, 
        principal,
        interest,
        minimum) {
            this.name = name;
            this.principal = principal;
            this.interest = interest;
            this.minimum = minimum;
        }

    /**
     * Get the minimum required payment for this loan
     * @returns {number}
     */
    getMinimumPayment() {
        return getMinimumMonthlyPayment(this.principal, this.interest, this.minimum);
    }
}

export { Loan };
