const loansSummary = Vue.component('loans-summary', {
    props: {
        'loans': Array
    },
    template: `
        <div id="loans-summary">
            <h1>Debt Calculator</h1>
            <div id="loans-summary-body">
                <max-payment v-bind:loans="loans"></max-payment>
                <loans v-bind:loans="loans"></loans>
                <new-loan></new-loan>
                <loan-graph></loan-graph>
            </div>
        </div>
    `
});