import { Payment } from '../models/loan/payment.mjs';
import { loanService } from '../services/loan-service.mjs';

var MaxPayment = Vue.component('max-payment', {
    data: function() {
        return {
            totalMonthlyPayment: 0
        }
    },
    props: {
        loans: Array
    },
    created: function() {
        this.totalMonthlyPayment = loanService.getTotalMonthlyPayment();
        this.$emit('total-monthly-payment-changed', this.totalMonthlyPayment);
    },
    computed: {
        minimumPayment: function() {
            const date = new Date();
            const payments = this.loans
                .map(ln => new Payment(ln, ln.principal, 0, date))
                .map(p => p.getMinimumMonthlyPayment(date));
            return payments.reduce((acc, x) => acc + x.amountPaid, 0);
        }
    },
    methods: {
        updateTotalMonthlyPayment: function(totalMonthlyPayment) {
            this.totalMonthlyPayment = totalMonthlyPayment;
            loanService.setTotalMonthlyPayment(totalMonthlyPayment);
            this.$emit('total-monthly-payment-changed', totalMonthlyPayment);
        }
    },
    template: `
        <div class="card large col-sm">
            <label for="max-payment">Total monthly Payment (Minimum: {{ minimumPayment | currency }})</label>
            <input 
                name="max-payment" 
                id="max-payment" 
                type="number" 
                v-model.number="totalMonthlyPayment"
                step="0.01"
                v-bind:minimum="minimumPayment"
                v-on:change="updateTotalMonthlyPayment($event.target.value)"
            ></input>
            <div v-if="minimumPayment > totalMonthlyPayment">
                <span class="error-message">If your payment is less than the minimum then the loan will never be repaid (it will accrue interest in excess of your payment).</span>
            </div>
        </div>
    `
});

export { MaxPayment };