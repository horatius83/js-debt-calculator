var PaymentPlanComponent = Vue.component('payment-plan-component', {
    props: {
        paymentPlan: Object
    },
    computed: {
        totalPrincipal: function() {
            if(this.paymentPlan) {
                var totalPrincipal = [...this.paymentPlan.paymentPlans.values()].map(plan => {
                    if(plan.loan && plan.loan.principal) {
                        return plan.loan.principal;
                    } else {
                        return 0;
                    }
                }).reduce((acc, x) => acc + x, 0);
                console.log(`Total Principal: ${totalPrincipal}`);
                return totalPrincipal;
            }
            return 0;
        },
        totalInterestPaid: function() {
            if(this.paymentPlan) {
                const totalPaid = [...this.paymentPlan.paymentPlans.values()].map(plan => {
                    if(plan.payments) {
                        return plan.payments.reduce((acc, x) => acc + x.amountPaid, 0);
                    } else {
                        return 0;
                    }
                }).reduce((acc, x) => acc + x, 0);
                const totalPrincipal = this.totalPrincipal;
                return totalPaid - totalPrincipal;
            }
            return 0;
        },
        numberOfMonthsToZeroDebt: function() {
            if(this.paymentPlan) {
                return [...this.paymentPlan.paymentPlans.values()].map(plan => {
                    return plan.payments.length;
                }).reduce((y, x) => x > y ? x : y);
            }
            return 0;
        }
    },
    template: `
        <div class="card fluid">
            <div class="section">
                Number of Months: {{ numberOfMonthsToZeroDebt }}
            </div>
            <div class="section">
                Total Interest Paid: {{ totalInterestPaid | currency }}
            </div>
        </div>
    ` 
});

export { PaymentPlanComponent }