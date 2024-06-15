import { getMinimumMonthlyPaymentWithinPeriod, getPrincipalPlusMonthlyInterest } from './interest.mjs';
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
     * @param {number} paid - how much was paid
     * @param {number} remaining - principal remaining
     * @param {number=} multiplier - multiplier (2 = 200% payment, 3 = 300% etc.)
     * @param {boolean=} paidMoreThanMinimum - user paid more than the minimum required
     * @param {boolean=} paidOffLoan - user paid this loan off
     */
    constructor(paid, remaining, multiplier, paidMoreThanMinimum = false, paidOffLoan = false) {
        this.paid = mustBeGreaterThan0(paid, 'Paid');
        this.remaining = mustBeGreaterThanOrEqualTo0(remaining, 'Remaining');
        this.multiplier = multiplier;
        this.paidMoreThanMinimum = paidMoreThanMinimum;
        this.paidOffLoan = paidOffLoan
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
     * @returns {number} - the minimum payment
     */
    getMinimum = (years) => {
        mustBeGreaterThan0(years, 'Years');
        const minimum = getMinimumMonthlyPaymentWithinPeriod(this.loan.principal, this.loan.interest / 100.0, this.loan.minimum, years);
        if (this.payments.length) { // Scenario: this is our last payment, the amount remaining is less than the minimum
            const remaining = this.payments?.at(-1)?.remaining || minimum;
            const remainingPlusInterest = getPrincipalPlusMonthlyInterest(remaining, this.loan.interest / 100.0);
            if (remainingPlusInterest < minimum) {
                return remainingPlusInterest;
            }
        } else if (this.loan.principal < minimum) { // Scenario: this is our first payment, but (somehow) the principal is less than the minimum
            const principalPlusInterest = getPrincipalPlusMonthlyInterest(this.loan.principal, this.loan.interest / 100.0);
            if (principalPlusInterest < minimum) {
                return principalPlusInterest;
            }
        }
        return minimum;
    }

    /**
     * Add a payment to this loan repayment plan
     * @param {number} amount - the amount available to pay on this loan
     * @param {number=} multiplier - is this a doubled / tripled / etc. payment
     * @param {boolean=} paidMoreThanMinimum - is this payment more than the minimum required
     * @returns {number} leftover money if this loan is paid off
     */
    makePayment(amount, multiplier, paidMoreThanMinimum) {
        mustBeGreaterThan0(amount, 'Amount');
        if (this.isPaidOff) {
            return amount;
        }
        const principalRemaining = this.payments.at(-1)?.remaining ?? this.loan.principal;
        const newPrincipal = getPrincipalPlusMonthlyInterest(principalRemaining, this.loan.interest / 100.0);
        /**
         * Create a new loan payment
         * @returns {[number, Payment]} - the amount remaining and the Payment to add
         */
        const createPayment = () => {
            if (newPrincipal > amount) {
                return [0, new Payment(amount, newPrincipal - amount, multiplier, paidMoreThanMinimum, false)];
            } else {
                const amountRemaining = amount - newPrincipal;
                this.isPaidOff = true;
                return [amountRemaining, new Payment(newPrincipal, 0, multiplier, paidMoreThanMinimum, true)]
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
                this.isPaidOff = true;
                return amount - this.targetAmount;
            }
        }
    }
}

export class PaymentPlanOutputMonth {
    /**
     * Summary of payments for a given month
     * @param {string} month - what month this took place
     * @param {Map<string, Payment>} loanPayments - payments that took place this month
     * @param {EmergencyFundPayment=} emergencyFundPayment - payment to Emergency Fund (if any)
     */
    constructor(month, loanPayments, emergencyFundPayment) {
        this.month = month;
        this.loanPayments = loanPayments;
        this.emergencyFundPayment = emergencyFundPayment
    }
}

export class PaymentPlan {
    /**
     * A class representing a plan to repay a group of loans
     * @param {Loan[]} loans - the loans to repay
     * @param {number} years - the maximum number of years to repay those loans
     * @param {(loans: Loan[]) => Loan[]} repaymentStrategy - determines how to prioritize the loans for repayment
     * @param {EmergencyFund=} emergencyFund - optional emergency fund to prioritize while paying down debt
     */
    constructor(loans, years, repaymentStrategy, emergencyFund) {
        this.loanRepayments = repaymentStrategy(loans).map(ln => new LoanRepayment(ln));
        this.years = mustBeGreaterThan0(years, 'Years');
        this.emergencyFund = emergencyFund;
    }

    /**
     * Get the minimum payment required for all the loans
     * @returns {number} 
     */
    getMinimumRequiredPayment() {
        return this.loanRepayments
            .filter(lr => !lr.isPaidOff)
            .map(lr => lr.getMinimum(this.years))
            .reduce((acc, x) => acc + x, 0);
    }

    /**
     * Create a plan to pay down a series of loans
     * @param {number} contributionAmount - the maximum amount of money that can be contributed to paying down the debt
     */
    createPlan(contributionAmount) {
        let minimumRequired = this.getMinimumRequiredPayment();
        if (contributionAmount < minimumRequired) {
            throw new Error(`The minimum amount required is $${minimumRequired.toFixed(2)} but contribution amount was $${contributionAmount}`);
        }
        let allLoansPaidOff = this.loanRepayments.every(lr => lr.isPaidOff);
        while (!allLoansPaidOff) {
            allLoansPaidOff = true;
            minimumRequired = this.getMinimumRequiredPayment();
            let totalBonus = contributionAmount - minimumRequired;
            let leftoverEmergencyFundBonus = this.emergencyFund && !this.emergencyFund.isPaidOff
                ? this.emergencyFund.addPayment(totalBonus * this.emergencyFund.percentageOfBonusFunds)
                : 0;
            let bonus = this.emergencyFund && !this.emergencyFund.isPaidOff
                ? totalBonus * (1.0 - this.emergencyFund.percentageOfBonusFunds) + leftoverEmergencyFundBonus
                : totalBonus;

            for (let lr of this.loanRepayments) {
                const minimumPayment = lr.getMinimum(this.years);
                if (lr.isPaidOff) {
                    // Since we don't need to pay this off, roll that amount into the bonus
                    continue;
                }
                allLoansPaidOff = false;
                bonus = lr.makePayment(minimumPayment + bonus, 1, bonus > 0);
            }
        }
    }

    /**
     * Convert a payment plan into an output-friendly format with dates, the name of the loans and what to pay
     * @param {Date} startDate - when the payment plan will begin
     * @returns {Generator<PaymentPlanOutputMonth>}
     */
    getPaymentPlanSeries(startDate) {
        const longestPaymentPlan = Math.max(...this.loanRepayments.map(x => x.payments.length));
        const startingMonth = startDate.getMonth();
        const startingYear = startDate.getFullYear();

        const options = /** @type { DateTimeFormatOptions }*/{ month: 'long', year: "numeric"};
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const that = this;

        return (function* () {
            for (let i=0; i<longestPaymentPlan; i++) {
                const month = (startingMonth + i) % 12;
                const year = startingYear + ((startingMonth + i) / 12);
                const date = new Date(year, month, 15);
                const m = new Map();

                for(const pp of that.loanRepayments) {
                    if (i < pp.payments.length) {
                        m.set(pp.loan.name, pp.payments[i]);
                    }
                }
                const emergencyFundPayment = i < that.emergencyFund?.payments.length ? that.emergencyFund?.payments[i] : undefined;
                yield new PaymentPlanOutputMonth(
                    formatter.format(date),
                    m,
                    emergencyFundPayment
                );
            }
        })();
    }
}

export class MultiplierPaymentPlan extends PaymentPlan {
    /**
     * A class representing a plan to repay a group of loans
     * @param {Loan[]} loans - the loans to repay
     * @param {number} years - the maximum number of years to repay those loans
     * @param {(loans: Loan[]) => Loan[]} repaymentStrategy - determines how to prioritize the loans for repayment
     * @param {EmergencyFund=} emergencyFund - optional emergency fund to prioritize while paying down debt
     */
    constructor(loans, years, repaymentStrategy, emergencyFund) {
        super(loans, years, repaymentStrategy, emergencyFund);
    }   

    /**
     * Create a plan to pay down a series of loans
     * @param {number} contributionAmount - the maximum amount of money that can be contributed to paying down the debt
     */
    createPlan(contributionAmount) {
        let minimumRequired = this.getMinimumRequiredPayment();
        if (contributionAmount < minimumRequired) {
            throw new Error(`The minimum amount required is $${minimumRequired.toFixed(2)} but contribution amount was $${contributionAmount}`);
        }
        let allLoansPaidOff = this.loanRepayments.every(lr => lr.isPaidOff);
        while (!allLoansPaidOff) {
            allLoansPaidOff = true;
            minimumRequired = this.getMinimumRequiredPayment();
            let totalBonus = contributionAmount - minimumRequired;
            let leftoverEmergencyFundBonus = this.emergencyFund && !this.emergencyFund.isPaidOff
                ? this.emergencyFund.addPayment(totalBonus * this.emergencyFund.percentageOfBonusFunds)
                : 0;
            let bonus = this.emergencyFund && !this.emergencyFund.isPaidOff
                ? totalBonus * (1.0 - this.emergencyFund.percentageOfBonusFunds) + leftoverEmergencyFundBonus
                : totalBonus;
            const loansThatCanBeMultiplied = this.loanRepayments
            .filter(ln => !ln.isPaidOff && Math.floor(bonus / ln.getMinimum(this.years)) > 1);

            // bonus + minimums of all the loans that are already paid off
            // 
            for (let lr of this.loanRepayments) {
                if (lr.isPaidOff) {
                    // Since we don't need to pay this off, roll that amount into the bonus
                    continue;
                }
                allLoansPaidOff = false;
                const minimumPayment = lr.getMinimum(this.years);
                const multiplier = Math.floor(bonus / minimumPayment);
                if (multiplier> 1) {
                    bonus = lr.makePayment(minimumPayment * multiplier, multiplier, bonus > 0) + (bonus - (minimumPayment * multiplier));
                } else {
                    bonus = lr.makePayment(minimumPayment, 1, bonus > 0) + (bonus - minimumPayment);
                }
            }
        }
    }
}

/**
 * Given a series of loan-names to minimum payments, produce a map of loan-names to multiples of those minimums
 * (This isn't guaranteed to find an optimal solution but it is simpler and more space-efficient than the dynamic 
 * programming algorithms I've seen)
 * @param {number} targetValue - the target value to be equal to or less than
 * @param {Array<[string, number]>} minimums - loan-name to minimum amount mapping
 * @returns {Map<string, number>} - multiples of each loan
 */
export function getAdditions(targetValue, minimums) {
    minimums.sort((a, b) => b[1] - a[1]); // sort descending
    /** @type { Map<string, number> } */
    const rv = minimums.reduce((m, x) => {
        m[x[0]] = 0;
        return m
    }, new Map());
    for (const [k,v] of minimums) {
        const count = Math.floor(targetValue / v);
        rv[k] = count;
        targetValue -= count * v;
    }
    return rv;
}