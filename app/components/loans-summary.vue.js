const loansSummary = Vue.component('loans-summary', {
    data: function() {
        return {
            loans: []
        };
    },
    created: function() {
        this.loans = loanService.getLoans();
    },
    methods: {
        addNewLoan: function(newLoan) {
            loanService.addLoan(newLoan);
        },
        deleteLoan: function(loan) {
           loanService.deleteLoan(loan);
        }
    },
    template: `
        <div id="loans-summary">
            <h1>Debt Calculator</h1>
            <div id="loans-summary-body">
                <max-payment v-bind:loans="loans"></max-payment>
                <loans v-bind:loans="loans" v-on:delete="deleteLoan"></loans>
                <new-loan v-on:add-new-loan="addNewLoan"></new-loan>
                <loan-graph></loan-graph>
            </div>
        </div>
    `
});