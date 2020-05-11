var LoanStrategy = Vue.component('loan-strategy', {
    created: function() {
        this.$emit('payment-strategy-changed', 'avalanche');
    },
    template: `
        <div class="card large col-sm">
            <label for="loan-payment-strategy">Loan Payment Strategy</label>
            <select id="loan-payment-strategy" v-on:change="$emit('payment-strategy-changed', $event.target.value)">
                <option value="avalanche">Avalanche</option>
                <option value="snowball">Snowball</option>
                <option value="double">Double-Double</option>
            </select>
        </div> 
    `
});

export { LoanStrategy };