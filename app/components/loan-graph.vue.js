Vue.component('loan-graph', {
    props: {
        loans: Array,
        totalMonthlyPayment: Number,
        paymentStrategy: Function
    },
    data: function() {
        return {
            shouldShowGraph: false,
            hasData: true,
            loanChart: undefined
        };
    },
    methods: {
        createDataset: function(label, hue, data) {
            const color = 'hsl( ' + hue + ', 90%, 80% )';
            const bgColor = 'hsl( ' + hue + ', 90%, 90% )';
            const hoverBorderColor = 'hsl( ' + hue + ', 90%, 50% )';
            return {
                label: label,
                fill: true,
                lineTension: 0.1,
                backgroundColor: bgColor,
                borderColor: color,
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: color,
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: color,
                pointHoverBorderColor: hoverBorderColor,
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: data,
                spanGaps: false,
            }
        },
        createLoanChart: function(elementId, labels, datasets) {
            const ctx = document.getElementById(elementId);
            const loan_chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero:true
                            },
                            stacked: true
                        }]
                    }
                }
            });
            return loan_chart;
        },
        displayGraph: function() {
            this.shouldShowGraph = !this.shouldShowGraph;
        }
    },
    updated: function() {
        console.log('updated');
        if(!this.shouldShowGraph) {
            return;
        }
        // Generate the data
        const paymentPlan = new PaymentPlan(this.loans, 12 * 10);
        paymentPlan.createPaymentPlan(new Date(), this.totalMonthlyPayment, this.paymentStrategy);
        if(paymentPlan.paymentPlans.size) {
            this.hasData = true;
            const loanPayments = [...paymentPlan.paymentPlans.values()];
            const [_, payments] = loanPayments.reduce((tuple, loanPaymentPlan) => {
                const [numberOfPayments, _] = tuple;
                if(loanPaymentPlan.payments.length > numberOfPayments) {
                    return [loanPaymentPlan.payments.length, loanPaymentPlan.payments];
                }
                return tuple;
            }, [-1, []]);
            const labels = payments.map(p => p.dateOfPayment.toLocaleDateString());
            const datasets = loanPayments.map(
                (loanPayment, i) => 
                    this.createDataset(
                        loanPayment.loan.name, 
                        i * 27, 
                        loanPayment.payments.map(payment => payment.principal)
                    )
            )
            this.loanChart = this.createLoanChart('graph-canvas', labels, datasets);
        } else {
            this.hasData = false;
        }
    },
    template: `
        <div class="card fluid" id="loan-graph">
            <div>
                <button v-on:click="displayGraph">{{ shouldShowGraph ? 'Hide' : 'Show' }} Graph</button>
            </div>
            <div v-if="shouldShowGraph">
                <canvas id="graph-canvas"></canvas>
            </div>
            <div v-if="shouldShowGraph && !hasData">
                There is no data to display.
            </div>
        </div>
    `
});