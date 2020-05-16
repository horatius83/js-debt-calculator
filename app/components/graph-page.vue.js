import { loanService } from '../services/loan-service.js';
import { Payment } from '../models/loan/payment.js';
import { avalanche, snowball, double } from '../models/loan/paymentStrategy.js';
import { PaymentPlan } from '../models/loan/paymentPlan.js';

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
        paymentStrategyMapper: function(nameOfPaymentStrategy) {
            const mapper = new Map([
                ['avalanche', avalanche],
                ['snowball', snowball],
                ['double', double],
            ]);
            return mapper.get(nameOfPaymentStrategy);
        },
        paymentStrategyChanged: function(newPaymentPlan) {
            this.paymentStrategy = this.paymentStrategyMapper(newPaymentPlan);
        },
        totalMonthlyPaymentChanged: function(newTotalMonthlyPayment) {
            this.totalMonthlyPayment = Number(newTotalMonthlyPayment);
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