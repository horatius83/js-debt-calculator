Vue.component('max-payment', {
    template: `
        <div class="row">
            <div class="card large">
                <label for="max-payment">Maximum Payment</label>
                <input name="max-payment" id="max-payment" type="number"></input>
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