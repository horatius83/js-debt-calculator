Vue.component('new-loan', {
    data: function() {
        return {
            shouldDisplayForm: false,
            name: '',
            principal: 0,
            interest: 0,
            minimum: 0
        };
    },
    methods: {
        clear: function() {
            this.shouldDisplayForm = false;
            this.name = '';
            this.principal = 0;
            this.interest = 0;
            this.minimum = 0;
        },
        addNewLoan: function() {
            this.$emit('add-new-loan', {
                name: this.name,
                principal: this.principal,
                interest: this.interest,
                minimum: this.minimum
            });
            this.clear();
        }
    },
    template: `
        <div class="card fluid">
            <div v-if="!shouldDisplayForm">
                <button v-on:click="shouldDisplayForm = true">Add New Loan</button>
            </div>
            <div v-if="shouldDisplayForm">
                <label for="new-loan-name">Name</label>
                <input name="new-loan-name" id="new-loan-name" v-model="name"></input>
                <label for="new-loan-principal">Principal</label>
                <input name="new-loan-principal" type="number" inputmode="decimal" v-model.number="principal" step="0.01"></input>
                <label for="new-loan-interest">Interest</label>
                <input name="new-loan-interest" id="new-loan-interest" type="number" inputmode="decimal" v-model.number="interest" step="0.01"></input>
                <label for="new-loan-minimum">Minimum</label>
                <input name="new-loan-minimum" id="new-loan-minimum" type="number" inputmode="decimal" v-model.number="minimum" step="0.01"></input>
                <div class="row">
                    <button class="primary" v-on:click="addNewLoan()">Create New Loan</button>
                    <button class="secondary" v-on:click="clear()">Cancel</button>
                </div>
            </div>
        </div>
    `
});