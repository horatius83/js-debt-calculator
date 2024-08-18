import { getMinimumMonthlyPaymentWithinPeriod, getPrincipalPlusMonthlyInterest } from './interest.mjs';
import { Loan } from './loan.mjs';
import Dinero from 'dinero.js';
import { zero } from './util.mjs';
import { EmergencyFund } from './emergencyFund.mjs';
import { LoanRepayment } from './loanRepayment.mjs';
import { PaymentPlanOutputMonth } from './paymentPlanOutputMonth.mjs';

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
    newLoans.sort((a,b) => a.principal.getAmount() - b.principal.getAmount());
    return newLoans;
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
        if (years <= 0) {
            throw new Error('Years must be greater than 0');
        }
        this.years = years;
        this.emergencyFund = emergencyFund;
    }

    /**
     * Get the minimum payment required for all the loans
     * @returns { Dinero.Dinero } 
     */
    getMinimumRequiredPayment() {
        return this.loanRepayments
            .filter(lr => !lr.isPaidOff)
            .map(lr => lr.getMinimum(this.years))
            .reduce((acc, x) => acc.add(x), zero);
    }

    /**
     * Create a plan to pay down a series of loans
     * @param { Dinero.Dinero } contributionAmount - the maximum amount of money that can be contributed to paying down the debt
     */
    createPlan(contributionAmount) {
        let minimumRequired = this.getMinimumRequiredPayment();
        if (contributionAmount < minimumRequired) {
            throw new Error(`The minimum amount required is $${minimumRequired} but contribution amount was $${contributionAmount}`);
        }
        let allLoansPaidOff = this.loanRepayments.every(lr => lr.isPaidOff);
        while (!allLoansPaidOff) {
            allLoansPaidOff = true;
            minimumRequired = this.getMinimumRequiredPayment();
            let totalBonus = contributionAmount.subtract(minimumRequired);
            let leftoverEmergencyFundBonus = this.emergencyFund && !this.emergencyFund.isPaidOff
                ? this.emergencyFund.addPayment(totalBonus.multiply(this.emergencyFund.percentageOfBonusFunds))
                : zero;
            let bonus = this.emergencyFund && !this.emergencyFund.isPaidOff
                ? totalBonus.multiply(1.0 - this.emergencyFund.percentageOfBonusFunds).add(leftoverEmergencyFundBonus)
                : totalBonus;

            for (let lr of this.loanRepayments) {
                const minimumPayment = lr.getMinimum(this.years);
                if (lr.isPaidOff) {
                    // Since we don't need to pay this off, roll that amount into the bonus
                    continue;
                }
                allLoansPaidOff = false;
                bonus = lr.makePayment(minimumPayment.add(bonus), 1, bonus.greaterThan(zero));
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
                const emergencyFundPayment = that.emergencyFund?.payments.length && i < that.emergencyFund.payments.length 
                    ? that.emergencyFund?.payments[i] 
                    : undefined;
                yield new PaymentPlanOutputMonth(
                    formatter.format(date),
                    m,
                    emergencyFundPayment
                );
            }
        })();
    }
}