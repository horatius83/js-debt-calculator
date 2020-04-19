Vue.component('loan-graph', {
    data: function() {
        return {
            shouldShowGraph: false
        };
    },
    template: `
        <div class="card fluid" id="loan-graph">
            <div>
                <button v-on:click="shouldShowGraph = !shouldShowGraph">{{ shouldShowGraph ? 'Hide' : 'Show' }} Graph</button>
            </div>
            <div v-if="shouldShowGraph">
                <p>loan-graph</p>
            </div>
        </div>
    `
});