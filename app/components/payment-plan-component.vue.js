import { Currency } from './filters.vue.js';

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
        },
        paymentsByMonth: function() {
            if(this.paymentPlan) {
                const payments = [...this.paymentPlan.paymentPlans.values()].reduce((arr, plan) => {
                    if(plan.payments) {
                        for(let i=0; i<plan.payments.length; ++i) {
                            const payment = plan.payments[i];
                            if (i in arr) {
                                arr[i].push(payment);
                            } else {
                                arr[i] = [payment];
                            }
                        }
                        return arr;
                    } else {
                        return arr;
                    }
                }, []);
                // Sort each month
                // ...
                return payments;
            }
            return [];
        }
    },
    template: `
        <div>
            <div v-for="payments in paymentsByMonth" class="card fluid">
                <h3 class="doc">{{ payments[0].dateOfPayment }}</h3>
                <div class="row">
                    <div v-for="payment in payments" class="card">
                        <div class="section">
                            <h4 class="doc">{{ payment.loan.name }}</h4>
                        </div>
                        <div class="section">
                            Pay {{ payment.amountPaid | currency }} 
                        </div>
                        <div class="section">
                            Amount Left {{ payment.principal | currency }}
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    ` 
});

export { PaymentPlanComponent }