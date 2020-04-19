Vue.component('new-loan', {
    data: function() {
        return {
            isExtended: false,
            name: '',
            principal: 0,
            
        }
    },
    methods: {
        addLoan: function() {

        },
        cancel: function() {

        },
        clear: function() {

        },
        getLoan: function() {

        }
    },
    template: `
        <div class="card fluid">
            <div v-if="!isExtended" v-on:click="isExtended = !isExtended">
                <input type="button" value="Create New Loan"></input>
            </div>
            <div v-if="isExtended">
                <h2>New Loan</h2>
                <label for="new-loan-name">Name</label>
                <input name="new-loan-name" id="new-loan-name" v-model="name"></input>
                <label for="new-loan-principal">Principal</label>
                <input name="new-loan-principal" type="number"></input>
                <label for="new-loan-interest">Interest</label>
                <input name="new-loan-interest" id="new-loan-interest" type="number"></input>
                <label for="new-loan-minimum">Minimum</label>
                <input name="new-loan-minimum" id="new-loan-minimum" type="number"></input>
                <div class="row">
                    <input type="button" value="Add Loan" v-on:click="addLoan()"></input>
                    <input type="button" value="Cancel" v-on:click="cancel()"></input>
                </div>
            </div>
        </div>
    `
});