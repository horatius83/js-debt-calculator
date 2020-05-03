const loansSummary = Vue.component('loans-summary', {
    data: function() {
        return {
            loans: [],
            paymentStrategy: undefined,
            totalMonthlyPayment: 0,
        };
    },
    computed: {
        minimumMonthlyPayment: function() {
            const date = new Date();
            const payments = this.loans
                .map(ln => new Payment(ln, ln.principal, 0, date))
                .map(p => p.getMinimumMonthlyPayment(date));
            return payments.reduce((acc, x) => acc + x.amountPaid, 0);
        },
        paymentPlan: function() {
            if (this.totalMonthlyPayment 
                && this.totalMonthlyPayment >= this.minimumMonthlyPayment
                && this.loans
                && this.paymentStrategy
            ) {
                console.log('paymentPlan created');
                const paymentPlan = new PaymentPlan(this.loans, 12 * 10);
                paymentPlan.createPaymentPlan(new Date(), this.totalMonthlyPayment, this.paymentStrategy);
                return paymentPlan;
            }
            return undefined;
        }
    },
    created: function() {
        this.loans = loanService.getLoans();
    },
    methods: {
        addNewLoan: function(newLoan) {
            loanService.addLoan(newLoan);
        },
        deleteLoan: function(loan) {
           loanService.deleteLoan(loan);
        },
        paymentStrategyMapper: function(nameOfPaymentStrategy) {
            const mapper = new Map([
                ['avalanche', avalanche],
                ['snowball', snowball],
                ['double', double],
            ]);
            return mapper.get(nameOfPaymentStrategy);
        },
        paymentStrategyChanged: function(newPaymentPlan) {
            console.log(`paymentStrategyChanged: ${newPaymentPlan}`);
            this.paymentStrategy = this.paymentStrategyMapper(newPaymentPlan);
        },
        totalMonthlyPaymentChanged: function(newTotalMonthlyPayment) {
            console.log(`totalMonthlyPaymentChanged: ${newTotalMonthlyPayment}`);
            this.totalMonthlyPayment = Number(newTotalMonthlyPayment);
        }
    },
    template: `
        <div id="loans-summary">
            <h1>Debt Calculator</h1>
            <div id="loans-summary-body">
                <max-payment 
                    v-bind:loans="loans" 
                    v-on:payment-strategy-changed="paymentStrategyChanged" 
                    v-on:total-monthly-payment-changed="totalMonthlyPaymentChanged"
                ></max-payment>
                <loans v-bind:loans="loans" v-on:delete="deleteLoan"></loans>
                <new-loan v-on:add-new-loan="addNewLoan"></new-loan>
                <loan-graph 
                    v-bind:paymentPlan="paymentPlan"
                ></loan-graph>
            </div>
        </div>
    `
});