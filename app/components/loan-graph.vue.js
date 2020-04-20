Vue.component('loan-graph', {
    data: function() {
        return {
            shouldShowGraph: false,
            chart: undefined
        };
    },
    methods: {
        createDataset: function(label, hue, data) {
            let color = 'hsl( ' + hue + ', 90%, 80% )';
            let bgColor = 'hsl( ' + hue + ', 90%, 90% )';
            let hoverBorderColor = 'hsl( ' + hue + ', 90%, 50% )';
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
        createLoanChart: function(elementId) {
            var ctx = document.getElementById(elementId);
            var loan_chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: []
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
        }
    },
    template: `
        <div class="card fluid" id="loan-graph">
            <div>
                <button v-on:click="shouldShowGraph = !shouldShowGraph">{{ shouldShowGraph ? 'Hide' : 'Show' }} Graph</button>
            </div>
            <div v-if="shouldShowGraph">
                <canvas id="loan-graph"></canvas>
            </div>
        </div>
    `
});