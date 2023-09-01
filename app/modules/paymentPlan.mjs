import { getMinimumMonthlyPaymentWithinPeriod } from './interest.mjs';
import { mustBeBetween, mustBeGreaterThan0, mustBeGreaterThanOrEqualTo0 } from './validation.mjs';

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
        this.principal = mustBeGreaterThan0(principal, 'Principal');
        this.interest = mustBeGreaterThanOrEqualTo0(interest, 'Interest');
        this.minimum = mustBeGreaterThan0(minimum, 'Minimum');
    }
}

export class Payment {
    /**
     * Represents a payment on a loan
     * @param {number} paid 
     * @param {number} remaining 
     * @param {boolean} isDoubled 
     */
    constructor(paid, remaining, isDoubled) {
        this.paid = mustBeGreaterThan0(paid, 'Paid');
        this.remaining = mustBeGreaterThanOrEqualTo0(remaining, 'Remaining');
        this.isDoubled = isDoubled;
    }
}

export class LoanRepayment {
    /**
     * A class representing the payments to pay off a loan
     * @param {Loan} loan - the loan to create the repayment for
     */
    constructor(loan) {
        this.loan = loan;
        /** @type { Payment[] } */
        this.payments = [];
        this.isPaidOff = false;
    }

    /**
     * Get the minimum payment needed to pay back loan
     * @param {number} years - the maximum number of years to pay back loan
     */
    getMinimum = (years) => {
        mustBeGreaterThan0(years, 'Years');
        return getMinimumMonthlyPaymentWithinPeriod(this.loan.principal, this.loan.interest, this.loan.minimum, years);
    }

    /**
     * Add a payment to this loan repayment plan
     * @param {number} amount - the amount available to pay on this loan
     * @param {boolean=} isDoubled - is this a doubled payment
     * @returns {number} leftover money if this loan is paid off
     */
    makePayment(amount, isDoubled = false) {
        mustBeGreaterThan0(amount, 'Amount');
        if (this.isPaidOff) {
            return amount;
        }
        const principalRemaining = this.payments.at(-1)?.remaining ?? this.loan.principal;
        /**
         * Create a new loan payment
         * @returns {[number, Payment]} - the amount remaining and the Payment to add
         */
        const createPayment = () => {
            if (principalRemaining > amount) {
                return [0, new Payment(amount, principalRemaining - amount, isDoubled)];
            } else {
                const amountRemaining = amount - principalRemaining;
                this.isPaidOff = true;
                return [amountRemaining, new Payment(principalRemaining, 0, isDoubled)]
            }
        }
        const [remainder, payment] = createPayment();
        this.payments.push(payment);
        return remainder;
    }
}

/**
 * Sort loans according to interest rate
 * @param {Loan[]} loans
 * @returns {Loan[]}
 */
export function avalancheRepayment(loans) {
    let newLoans = [...loans];
    newLoans.sort((a, b) => b.interest - a.interest);
    return newLoans;
}

/**
 * Sort loans according to principal (smallest first)
 * @param {Loan[]} loans 
 * @returns {Loan[]}
 */
export function snowballRepayment(loans) {
    let newLoans = [...loans];
    newLoans.sort((a,b) => a.principal - b.principal);
    return newLoans;
}

export class EmergencyFundPayment {
    /**
     * A individual payment toward an emergency fund
     * @param {number} payment 
     * @param {number} amountRemaining 
     */
    constructor(payment, amountRemaining) {
        this.payment = mustBeGreaterThan0(payment, 'Payment');
        this.amountRemaining = mustBeGreaterThanOrEqualTo0(amountRemaining, 'Amount Remaining');
    }
}

export class EmergencyFund {
    /**
     * A payment plan for an emergency fund, once the target amount is reached, all further bonus money will be 
     * applied to the loans
     * @param {number} targetAmount - the target amount for the Emergency fund
     * @param {number} percentageOfBonusFunds - the percentage of bonus funds to apply to the emergency fund
     */
    constructor(targetAmount, percentageOfBonusFunds) {
        this.targetAmount = mustBeGreaterThan0(targetAmount, 'Target Amount');
        this.percentageOfBonusFunds = mustBeBetween(0, percentageOfBonusFunds, 1, 'Percentage of Bonus Funds');
        /** @type {EmergencyFundPayment[]} */
        this.payments = [];
        this.isPaidOff = false;
    }

    /**
     * Add payment to emergency fund and return any remaining money if partial or no payment is needed
     * @param {number} amount - the amount to pay to the Emergency Fund
     * @returns {number} - amount leftover if this is paid off
     */
    addPayment(amount) {
        mustBeGreaterThan0(amount, 'Amount');
        if (this.isPaidOff) {
            return amount;
        }
        const mostRecentPayment = this.payments.at(-1);
        if (mostRecentPayment) {
            if (mostRecentPayment.amountRemaining > amount) {
                this.payments.push(new EmergencyFundPayment(amount, mostRecentPayment.amountRemaining - amount));
                return 0;
            } else {
                this.payments.push(new EmergencyFundPayment(mostRecentPayment.amountRemaining, 0));
                this.isPaidOff = true;
                return amount - mostRecentPayment.amountRemaining;
            }
        } else {
            if (this.targetAmount > amount) {
                this.payments.push(new EmergencyFundPayment(amount, this.targetAmount - amount));
                return 0;
            } else {
                this.payments.push(new EmergencyFundPayment(this.targetAmount, 0));
                return amount - this.targetAmount;
            }
        }
    }
}

const MAXIMUM_NUMBER_OF_YEARS = 20;

export class PaymentPlan {
    /**
     * A class represnting a plan to repay a group of loans
     * @param {Loan[]} loans - the loans to repay
     * @param {number} years - the maximum number of years to repay those loans
     * @param {(loans: Loan[]) => Loan[]} repaymentStrategy - determines how to prioritize the loans for repayment
     * @param {EmergencyFund=} emergencyFund - optional emergency fund to prioritize while paying down debt
     * @param {number=} lowestInterestRate - any loans under this APR, just pay the minimum
     */
    constructor(loans, years, repaymentStrategy, emergencyFund, lowestInterestRate) {
        this.loanRepayments = repaymentStrategy(loans).map(ln => new LoanRepayment(ln));
        this.years = mustBeGreaterThan0(years, 'Years');
        this.emergencyFund = emergencyFund;
        this.lowestInterestRate = lowestInterestRate || 0;
    }

    /**
     * Get the minimum amount to pay on a loan (taking minimum interest into account)
     * @param {LoanRepayment} lr 
     * @returns {number} 
     */
    getMinimum(lr) {
        return lr.loan.interest >= this.lowestInterestRate
            ? lr.getMinimum(this.years)
            : lr.getMinimum(MAXIMUM_NUMBER_OF_YEARS);
    }

    /**
     * Create a plan to pay down a series of loans
     * @param {number} contributionAmount - the maximum amount of money that can be contributed to paying down the debt
     */
    createPlan(contributionAmount) {
        mustBeGreaterThan0(contributionAmount, 'Contribution Amount');
        const minimumRequired = this.loanRepayments
            .map(lr => lr.getMinimum(this.years))
            .reduce((acc, x) => acc + x, 0);
        if (contributionAmount < minimumRequired) {
            throw new Error(`The minimum amount required is ${minimumRequired}`);
        }
        let allLoansPaidOff = false;
        while (!allLoansPaidOff) {
            allLoansPaidOff = true;
            let totalBonus = this.loanRepayments
                .filter(lr => !lr.isPaidOff)
                .map(this.getMinimum)
                .reduce((acc, x) => acc + x, 0);
            let leftoverEmergencyFundBonus = this.emergencyFund && !this.emergencyFund.isPaidOff
                ? this.emergencyFund.addPayment(totalBonus * this.emergencyFund.percentageOfBonusFunds)
                : 0;
            let bonus = this.emergencyFund && !this.emergencyFund.isPaidOff
                ? totalBonus * (1.0 - this.emergencyFund.percentageOfBonusFunds) + leftoverEmergencyFundBonus
                : totalBonus;

            for (let lr of this.loanRepayments) {
                if (lr.isPaidOff) {
                    // Since we don't need to pay this off, roll that amount into the bonus
                    bonus += this.getMinimum(lr); 
                    continue;
                }
                allLoansPaidOff = false;
                bonus = lr.makePayment(bonus);
            }
        }
    }
}