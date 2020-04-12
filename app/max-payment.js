Vue.component('max-payment', {
    data: function() {
        return {
            totalMonthlyPayment: 0
        }
    },
    props: {
        loans: Array
    },
    created: function() {
        console.log('Loaded!');
        this.totalMonthlyPayment = this.minimumPayment;
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
        <div class="row">
            <div class="card large">
                <label for="max-payment">Total monthly Payment</label>
                <input 
                    name="max-payment" 
                    id="max-payment" 
                    type="number" 
                    v-model.number="totalMonthlyPayment"
                    step="0.01"
                ></input>
                <div v-if="minimumPayment > totalMonthlyPayment">
                    <span class="error-message">Total monthly payment must exceed minimum required payment.</span>
                </div>
            </div>
            <div class="card large">
                <label for="loan-payment-strategy">Loan Payment Strategy</label>
                <select id="loan-payment-strategy">
                    <option value="avalanche">Avalanche</option>
                    <option value="snowball">Snowball</option>
                    <option value="double">Double-Double</option>
                    <option value="minimum">Minimum</option>
                </select>
            </div>
        </div>
    `
});