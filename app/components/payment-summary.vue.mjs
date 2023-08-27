export const PaymentSummary = Vue.component('payment-summary', {
    props: {
        paymentPlan: Object
    },
    computed: {
        totalPrincipal: function() {
            return this?.paymentPlan?.getTotalPrincipal() ?? 0;
        },
        totalInterestPaid: function() {
            return this?.paymentPlan?.getTotalInterestPaid() ?? 0;
        },
        numberOfMonthsToZeroDebt: function() {
           return this?.paymentPlan?.getNumberOfMonthsUntilZeroDebt() ?? 0; 
        }
    },
    template: `
        <div class="card large col-sm">
            <div class="section">
                Number of Months: {{ numberOfMonthsToZeroDebt }}
            </div>
            <div class="section">
                Total Interest Paid: {{ totalInterestPaid | currency }}
            </div>
        </div>
    `
});