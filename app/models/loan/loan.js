import { getMinimumMonthlyPayment } from '../util/interest.js';

class Loan {
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

    getMinimumPayment() {
        return getMinimumMonthlyPayment(this.principal, this.interest, this.minimum);
    }
}

export { Loan };
