import { Payment } from '../models/loan/payment.js';

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
        this.totalMonthlyPayment = this.minimumPayment;
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
    template: `
        <div class="card large col-sm">
            <label for="max-payment">Total monthly Payment</label>
            <input 
                name="max-payment" 
                id="max-payment" 
                type="number" 
                v-model.number="totalMonthlyPayment"
                step="0.01"
                v-on:change="$emit('total-monthly-payment-changed', $event.target.value)"
            ></input>
            <div v-if="minimumPayment > totalMonthlyPayment">
                <span class="error-message">Total monthly payment must exceed minimum required payment.</span>
            </div>
        </div>
    `
});

export { MaxPayment };