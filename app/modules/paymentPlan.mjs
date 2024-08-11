import { getMinimumMonthlyPaymentWithinPeriod, getPrincipalPlusMonthlyInterest } from './interest.mjs';
import { mustBeBetween, mustBeGreaterThan0, mustBeGreaterThanOrEqualTo0 } from './validation.mjs';




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