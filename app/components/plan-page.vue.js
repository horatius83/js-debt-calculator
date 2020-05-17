import { MaxPayment } from './max-payment.vue.js';
import { LoanStrategy } from './loan-strategy.vue.js';
import { PaymentSummary } from './payment-summary.vue.js';
import { PaymentPlanComponent } from './payment-plan-component.vue.js';
import { loanService } from '../services/loan-service.js';
import { PaymentPlan } from '../models/loan/paymentPlan.js';


export var PlanPage = Vue.component('plan-page', {
    data: function() {
        return {
            loans: [],
            paymentStrategy: loanService.getPaymentStrategy(),
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
    },
    methods: {
        paymentStrategyChanged: function(newPaymentPlan) {
            this.paymentStrategy = loanService.getPaymentStrategy();
        },
        totalMonthlyPaymentChanged: function(newTotalMonthlyPayment) {
            loanService.setTotalMonthlyPayment(Number(newTotalMonthlyPayment));
            this.totalMonthlyPayment = loanService.getTotalMonthlyPayment();
        }
    },
    template: `
    <div>
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
        <payment-plan-component
            v-bind:paymentPlan="paymentPlan"
        >
        </payment-plan-component>
    </div>
    `
});