import { getMinimumMonthlyPaymentWithinPeriod } from './interest.mjs';

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

export class Payment {
    /**
     * Represents a payment on a loan
     * @param {number} paid 
     * @param {number} remaining 
     * @param {boolean} isDoubled 
     */
    constructor(paid, remaining, isDoubled) {
        if (paid < 0) {
            throw new Error(`Payment - paid amount (${paid}) may not be less than 0`);
        }
        if (remaining < 0) {
            throw new Error(`Payment - remaining amount (${remaining}) may not be less than 0`);
        }
        this.paid = paid;
        this.remaining = remaining;
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
    getMinimum = (years) =>
        getMinimumMonthlyPaymentWithinPeriod(this.loan.principal, this.loan.interest, this.loan.minimum, years);

    /**
     * Add a payment to this loan repayment plan
     * @param {number} amount - the amount available to pay on this loan
     * @param {boolean=} isDoubled - is this a doubled payment
     * @returns {number} leftover money if this loan is paid off
     */
    makePayment(amount, isDoubled = false) {
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
    return loans;
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
        if (payment < 0) {
            throw new Error(`Emergency Fund - payment (${payment}) may not be less than 0`);
        }
        if (amountRemaining < 0) {
            throw new Error(`Emergency Fund - amount remaining (${amountRemaining}) may not be less than 0`);
        }
        this.payment = payment;
        this.amountRemaining = amountRemaining;
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
        if (percentageOfBonusFunds < 0 || percentageOfBonusFunds > 1) {
            throw new Error(`Emergency Fund percentage (${percentageOfBonusFunds * 100}%) may not be less than 0% or greater than 100%`)
        }
        if (targetAmount < 0) {
            throw new Error(`Emergency Fund target amount (${targetAmount}) may not be less than 0`);
        }
        this.targetAmount = targetAmount;
        this.percentageOfBonusFunds = percentageOfBonusFunds;
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
        this.years = years;
        this.emergencyFund = emergencyFund;
        this.lowestInterestRate = lowestInterestRate || 0;
        this.MAXIMUM_NUMBER_OF_YEARS = 20;
    }

    /**
     * Get the minimum amount to pay on a loan (taking minimum interest into account)
     * @param {LoanRepayment} lr 
     * @returns {number} 
     */
    getMinimum(lr) {
        return lr.loan.interest >= this.lowestInterestRate
            ? lr.getMinimum(this.years)
            : lr.getMinimum(this.MAXIMUM_NUMBER_OF_YEARS);
    }

    /**
     * Create a plan to pay down a series of loans
     * @param {number} contributionAmount - the maximum amount of money that can be contributed to paying down the debt
     */
    createPlan(contributionAmount) {
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