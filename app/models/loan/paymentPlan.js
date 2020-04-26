// import { LoanPaymentPlan } from './loanpaymentplan.model'

class PaymentPlan {
    constructor(loans, maxNumberOfPayments) {
        this.loans = loans;
        this._maxNumberOfPayments = maxNumberOfPayments || 40 * 12;
        if(!loans) {
            throw new Error('Cannot create a payment plan with undefined loans');
        }
        this.paymentPlans = new Map(loans.map(ln => [ln.name, new LoanPaymentPlan(ln)]));
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