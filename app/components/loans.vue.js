Vue.component('loans', {
    props: {
        loans: Array
    },
    template: `
        <div class="card fluid">
            <h2>Loans</h2>
            <table id="loans-table">
                <thead>
                    <th class="loans-table-name-column">Name</th>
                    <th class="loans-table-principal-column">Principal</th>
                    <th class="loans-table-interest-column">Interest</th>
                    <th class="loans-table-minimum-column">Minimum</th>
                    <th class="loans-table-details-column"></th>
                    <th class="loans-table-delete-column"></th>
                </thead>
                <tr v-for="loan in loans">
                    <td data-label="Name">{{ loan.name }}</td>
                    <td data-label="Principal">{{ loan.principal | currency }}</td>
                    <td data-label="Interest">{{ loan.interest }}%</td>
                    <td data-label="Minimum">{{ loan.minimum | currency }}</td>
                    <td><button>Details</button></td>
                    <td><button v-on:click="$emit('delete', loan)">Delete</button></td>
                </tr>
            </table>
        </div>
    `
});