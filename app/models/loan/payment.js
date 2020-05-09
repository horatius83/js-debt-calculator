import { calculateNewPrincipalForMonth, getMinimumMonthlyPayment } from '../util/interest.js';

export class Payment {
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

export function createPayment(loan, dateOfPayment) {
    const minimumPayment = loan.getMinimumPayment();
    const newPrincipal = calculateNewPrincipalForMonth(loan.principal, loan.interest);
    return new Payment(loan, newPrincipal - minimumPayment, minimumPayment, dateOfPayment);
}