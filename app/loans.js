Vue.component('loans', {
    props: {
        loans: Array
    },
    template: `
        <div class="card fluid">
        <h2>Loans</h2>
            <table>
                <thead>
                    <th>Name</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Minimum</th>
                    <th></th>
                </thead>
                <tr v-for="loan in loans">
                    <td>{{ loan.name }}</td>
                    <td>{{ loan.principal | currency }}</td>
                    <td>{{ loan.interest }}%</td>
                    <td>{{ loan.minimum | currency }}</td>
                    <td><input type="button" value="Delete"></input></td>
                </tr>
            </table>
        </div>
    `
});