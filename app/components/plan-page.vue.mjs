import { MaxPayment } from './max-payment.vue.mjs';
import { LoanStrategy } from './loan-strategy.vue.mjs';
import { PaymentSummary } from './payment-summary.vue.mjs';
import { PaymentPlanComponent } from './payment-plan-component.vue.mjs';
import { loanService } from '../services/loan-service.mjs';
import { PaymentPlan } from '../models/loan/paymentPlan.mjs';


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
        this.totalMonthlyPayment = loanService.getTotalMonthlyPayment();
    },
    methods: {
        paymentStrategyChanged: function(newPaymentPlan) {
            this.paymentStrategy = loanService.getPaymentStrategy();
        },
        totalMonthlyPaymentChanged: function(newTotalMonthlyPayment) {
            this.totalMonthlyPayment = newTotalMonthlyPayment;
            loanService.setTotalMonthlyPayment(Number(newTotalMonthlyPayment));
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