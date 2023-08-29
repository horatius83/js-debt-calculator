export class Loan {
    /**
     * Class represnting an amount of money owed
     * @param {string} name - the name of the loan
     * @param {number} principal - the principal of the loan
     * @param {number} interest - the interest (APR)
     * @param {number} minimum - the minimum payment
     */
    constructor(name, principal, interest, minimum) {
        this.name = name;
        this.principal = principal;
        this.interest = interest;
        this.minimum = minimum;
    }
}