import { PaymentPlan } from '../models/loan/paymentPlan.mjs';
import { loanService } from '../services/loan-service.mjs';
import { LoanGraph } from '../components/loan-graph.vue.mjs';

export var GraphPage = Vue.component('graph-page', {
    data: function() {
        return {
            loans: [],
            paymentStrategy: undefined,
            totalMonthlyPayment: 0,
        };
    },
    computed: {
        minimumMonthlyPayment: function() {
            return loanService.getMinimumMonthlyPayment(new Date());
        },
        paymentPlan: function() {
            if (this.totalMonthlyPayment 
                && this.totalMonthlyPayment >= this.minimumMonthlyPayment
                && this.loans
                && this.paymentStrategy
            ) {
                const paymentPlan = new PaymentPlan(this.loans, 12 * 30);
                paymentPlan.createPaymentPlan(new Date(), this.totalMonthlyPayment, this.paymentStrategy.strategy);
                return paymentPlan;
            }
            return undefined;
        }
    },
    created: function() {
        this.loans = loanService.getLoans();
        this.paymentStrategy = loanService.getPaymentStrategy();
        this.totalMonthlyPayment = loanService.getTotalMonthlyPayment();
    },
    methods: {
        paymentStrategyChanged: function(newPaymentPlan) {
            loanService.setPaymentStrategy(newPaymentPlan);
            this.paymentStrategy = loanService.getPaymentStrategy();
        },
        totalMonthlyPaymentChanged: function(newTotalMonthlyPayment) {
            loanService.setTotalMonthlyPayment(Number(newTotalMonthlyPayment));
            this.totalMonthlyPayment = loanService.getTotalMonthlyPayment();
        }
    },
    template: `
        <div id="loans-summary">
            <div id="loans-summary-body">
                <div class="row">
                    <max-payment 
                        v-bind:loans="loans" 
                        v-on:total-monthly-payment-changed="totalMonthlyPaymentChanged"
                    ></max-payment>
                    <loan-strategy
                        v-on:payment-strategy-changed="paymentStrategyChanged" 
                    >
                    </loan-strategy>
                    <payment-summary
                        v-bind:paymentPlan="paymentPlan"
                    >
                    </payment-summary>
                </div>
                <loan-graph 
                    v-bind:paymentPlan="paymentPlan"
                ></loan-graph>
            </div>
        </div>
    `
});