const loansSummary = Vue.component('loans-summary', {
    props: {
        'loans': Array
    },
    methods: {
        addNewLoan: function(newLoan) {
            this.loans.push(newLoan);
        },
        deleteLoan: function(loan) {
            let index = -1;
            for(let i in this.loans) {
                const existingLoan = this.loans[i];
                if(existingLoan.name == loan.name) {
                    index = i;
                    break;
                }
            }
            if(index > -1) {
                this.loans.splice(index,1);
            }
        }
    },
    template: `
        <div id="loans-summary">
            <nav>
                <div class="row">
                    <a href="https://google.com">Google</a> 
                    <a href="https://google.com">Google</a> 
                </div>
            </nav>

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