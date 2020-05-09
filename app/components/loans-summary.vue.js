import { LoanGraph } from './loan-graph.vue.js';
import { MaxPayment } from './max-payment.vue.js';
import { NewLoan } from './new-loan.vue.js';
import { Loans } from './loans.vue.js';
import { loanService } from '../services/loan-service.js';
import { Payment } from '../models/loan/payment.js';
import { avalanche, snowball, double } from '../models/loan/paymentStrategy.js';
import { PaymentPlan } from '../models/loan/paymentPlan.js';

export const loansSummary = Vue.component('loans-summary', {
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
                const paymentPlan = new PaymentPlan(this.loans, 12 * 30);
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
                <loans v-bind:loans="loans" v-on:delete="deleteLoan"></loans>
                <new-loan v-on:add-new-loan="addNewLoan"></new-loan>
                <max-payment 
                    v-bind:loans="loans" 
                    v-on:payment-strategy-changed="paymentStrategyChanged" 
                    v-on:total-monthly-payment-changed="totalMonthlyPaymentChanged"
                ></max-payment>
                <loan-graph 
                    v-bind:paymentPlan="paymentPlan"
                ></loan-graph>
            </div>
        </div>
    `
});