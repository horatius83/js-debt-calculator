Vue.component('loan-graph', {
    data: function() {
        return {
            shouldShowGraph: false
        };
    },
    template: `
        <div class="card fluid" id="loan-graph">
            <div v-if="!shouldShowGraph">
                <button v-on:click="shouldShowGraph = !shouldShowGraph">Show Graph</button>
            </div>
            <div v-if="shouldShowGraph">
                <button v-on:click="shouldShowGraph = !shouldShowGraph">Show Graph</button>
                <p>loan-graph</p>
            </div>
        </div>
    `
});