import { LoanPaymentPlan } from './loanPaymentPlan.js';
import { getLoanPaymentAmount } from './interest.js';

export class PaymentPlan {
    constructor(loans, maxNumberOfPayments) {
        this.loans = loans;
        this._maxNumberOfPayments = maxNumberOfPayments || 10 * 12;
        if(!loans) {
            throw new Error('Cannot create a payment plan with undefined loans');
        }
        this.paymentPlans = new Map(loans.map(ln => [ln.name, new LoanPaymentPlan(ln)]));
    }

    getTotalPrincipal() {
        return [...this.paymentPlans.values()]
            .map(plan => plan?.loan?.principal ?? 0)
            .reduce((acc, x) => acc + x, 0);
    }

    getTotalInterestPaid() {
        const totalPaid = [...this.paymentPlans.values()]
            .map(plan => plan.payments?.reduce((acc, x) => acc + x.amountPaid, 0) ?? 0)
            .reduce((acc, x) => acc + x, 0);
        return totalPaid - this.getTotalPrincipal();
    }

    getNumberOfMonthsUntilZeroDebt() {
        return [...this.paymentPlans.values()]
            .map(plan => plan.payments.length)
            .reduce((y, x) => x > y ? x : y)
    }

    getMinimumPayments(paymentDate) {
        return [...this.paymentPlans.values()]
            .map(pp => pp.getMinimumPayment(paymentDate));
    }

    getTotalAmountPaid(payments) {
       return payments
        .map(x => x.amountPaid)
        .reduce((acc,x) => acc + x, 0);
    }

    applyPaymentPlanForThisMonth(
        dateOfPayment, 
        monthlyPaymentAmount,
        paymentStrategy
        ) {

        const minimumPaymentsThisMonth = this.getMinimumPayments(dateOfPayment);
        const totalMinimumPaymentsThisMonth = this.getTotalAmountPaid(minimumPaymentsThisMonth);
        if(totalMinimumPaymentsThisMonth <= 0) {
            return false;
        }
        const payments = [...this.paymentPlans.values()].map(x => x.getMostRecentPayment(dateOfPayment));
        const newPayments = paymentStrategy(payments, monthlyPaymentAmount, dateOfPayment);
        const newPaymentsTotalAmountRemaining = newPayments.map(x => x.principal).reduce((acc, x) => acc + x, 0);
        for(const newPayment of newPayments) {
            this.paymentPlans.get(newPayment.loan.name).payments.push(newPayment);
        }
        return newPaymentsTotalAmountRemaining > 0;
    }

    createPaymentPlan(
        startingDate,
        monthlyPaymentAmount,
        paymentStrategy
    ) {
        let shouldKeepGoing = true;
        let year = startingDate.getFullYear();
        let month = startingDate.getMonth();
        let day = startingDate.getDate();
        let currentDate = new Date(year, month, day);
        let paymentCount = 1;

        const minimumPaymentsThisMonth = this.getMinimumPayments(startingDate);
        const totalMinimumPaymentsThisMonth = this.getTotalAmountPaid(minimumPaymentsThisMonth);
        if(totalMinimumPaymentsThisMonth > monthlyPaymentAmount) {
            throw new Error(`Monthly payment amount ${monthlyPaymentAmount} was less than the minimum amount needed ${totalMinimumPaymentsThisMonth}`);
        }

        do {
            shouldKeepGoing = this.applyPaymentPlanForThisMonth(currentDate, monthlyPaymentAmount, paymentStrategy);
            if(month + 1 < 12) {
                month = month + 1;
            } else {
                month = 0;
                year += 1;
            }
            currentDate = new Date(year, month, day);
            paymentCount += 1;
            if(paymentCount > this._maxNumberOfPayments) {
                throw new Error(`Payments exceeded the maximum number of payments (${this._maxNumberOfPayments})`);
            }
        } while(shouldKeepGoing);
    }
}

export class PaymentPlanV2 {
    /**
     * Create a payment plan
     * @param {Loan[]} loans - A list of all the loans 
     * @param {number} maxNumberOfPayments - maximum number of payments
     * @param {number} totalPayment - total amount to be paid per month
     * @param {function} paymentStrategy - strategy to use when there is money left over
     */
    constructor(loans, maxNumberOfPayments, totalPayment, paymentStrategy) {
        if(!loans) {
            throw new Error('Cannot create a payment plan with undefined loans');
        }
        this.loans = loans;
        this.maxNumberOfPayments = maxNumberOfPayments || 10 * 12;
        this.minimumPerMonthPayments = new Map(loans.map(ln => {
            const interestPerPeriod = ln.interest / 12.0;
            const minimumPayment = Math.min(
                Math.max(
                    getLoanPaymentAmount(ln.principal, interestPerPeriod, maxNumberOfPayments),
                    ln.minimumPayment
                ),
                ln.principal
            )
            return [ln.name, minimumPayment]
        }));
        this.minimumTotalPayment = this.minimumPerMonthPayment.values().reduce((acc, x) => acc + x, 0);
        if(totalMinimumPayment > totalPayment) {
            throw new Error(`Total amount cannot be less than ${totalMinimumPayment}`);
        }
        this.payments = new Map(loans.map(ln => [ln.name, []]));
        // Allow multiple payments per pay period
        // Need to keep track of principal since that's what will be graphed
        // Need to keep track of payments also since we'll need to highlight those  {newPrincipal: number, amountPaid: [number]}
        // What should paymentStrategy do here? Should it do all the payment calculations or just prioritize loans? What does that mean for double?
        // (paymentStrategy) :: Loans -> TotalAmount -> {Loan.Name -> [{newPrincipal: number, amountPaid: number}]}
    }

    getMinimumTotalPayment() {
        return this.minimumTotalPayment;
    }
}