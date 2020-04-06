Vue.component('new-loan', {
    template: `
        <div class="card fluid">
            <h2>New Loan</h2>
            <label for="new-loan-name">Name</label>
            <input name="new-loan-name" id="new-loan-name"></input>
            <label for="new-loan-principal">Principal</label>
            <input name="new-loan-principal" type="number"></input>
            <label for="new-loan-interest">Interest</label>
            <input name="new-loan-interest" id="new-loan-interest" type="number"></input>
            <label for="new-loan-minimum">Minimum</label>
            <input name="new-loan-minimum" id="new-loan-minimum" type="number"></input>
            <input type="button" value="Create New Loan"></input>
        </div>
    `
});