Vue.component('loans', {
    props: {
        loans: Array
    },
    template: `
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
                <td>{{ loan.principal }}</td>
                <td>{{ loan.interest }}</td>
                <td>{{ loan.minimum }}</td>
                <td><input type="button" value="Delete"></input></td>
            </tr>
        </table>
    `
});