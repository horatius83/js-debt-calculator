import { loanService } from '../services/loan-service.js';

var LoanStrategy = Vue.component('loan-strategy', {
    data: function() {
        return {
            strategies: Object.values(loanService.getPaymentStrategies()),
            selectedStrategy: loanService.getPaymentStrategy()
        };
    },
    methods: {
        paymentStrategyChanged: function(newPaymentPlan) {
            loanService.setPaymentStrategy(newPaymentPlan);
            this.$emit('payment-strategy-changed', newPaymentPlan);
        }
    },
    template: `
        <div class="card large col-sm">
            <label for="loan-payment-strategy">Loan Payment Strategy</label>
            <select 
                id="loan-payment-strategy" 
                v-on:change="paymentStrategyChanged($event.target.value)"
                v-bind:value="selectedStrategy.name"
            >
                <option v-for="strategy in strategies" v-bind:value="strategy.name">{{ strategy.displayName }}</option>
            </select>
        </div> 
    `
});

export { LoanStrategy };