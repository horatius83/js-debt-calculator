import { calculateNewPrincipalForMonth, getMinimumMonthlyPayment } from '../util/interest.mjs';
import { Loan } from "./loan.mjs"

export class Payment {
    /**
     * A payment on a loan
     * @param {Loan} loan - the loan that the payment was made on
     * @param {number} principal - the principal remaining
     * @param {number} amountPaid - the amount paid
     * @param {Date} dateOfPayment - when the payment was made
     */
    constructor(
        loan,
        principal, 
        amountPaid, 
        dateOfPayment) {
            this.loan = loan;
            this.principal = principal;
            this.amountPaid = amountPaid;
            this.dateOfPayment = dateOfPayment;
            this.wasDoubled = false;
        }

    /**
     * Get the minimum required payment for this loan
     * @param {Date} dateOfPayment 
     * @returns {Payment}
     */
    getMinimumMonthlyPayment(dateOfPayment) {
        const newPrincipal = calculateNewPrincipalForMonth(this.principal, this.loan.interest);
        const minimum = getMinimumMonthlyPayment(newPrincipal, this.loan.interest, this.loan.minimum);
        return new Payment(
            this.loan,
            Math.max(newPrincipal - minimum, 0),
            minimum,
            dateOfPayment
        )
    }

    /**
     * Create a payment with bonus money
     * @param {number} bonusMoney 
     * @returns {[Payment, number]}
     */
    createBonusMoneyPayment(bonusMoney) {
        let bonusPayment = new Payment(this.loan, this.principal, this.amountPaid, this.dateOfPayment);
        if(bonusMoney < bonusPayment.principal) {
            bonusPayment.principal -= bonusMoney;
            bonusPayment.amountPaid += bonusMoney;
            bonusMoney = 0;
        } else {
            bonusMoney -= bonusPayment.principal;
            bonusPayment.amountPaid += bonusPayment.principal;
            bonusPayment.principal = 0;
        }
        return [bonusPayment, bonusMoney];
    }
}

/**
 * Create a new minimum payment for a given loan
 * @param {Loan} loan 
 * @param {Date} dateOfPayment 
 * @returns {Payment} 
 */
export function createPayment(loan, dateOfPayment) {
    const minimumPayment = loan.getMinimumPayment();
    const newPrincipal = calculateNewPrincipalForMonth(loan.principal, loan.interest);
    return new Payment(loan, newPrincipal - minimumPayment, minimumPayment, dateOfPayment);
}