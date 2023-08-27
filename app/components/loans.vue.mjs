import { Currency } from './filters.vue.mjs';

var Loans = Vue.component('loans', {
    data: function() {
        return {
            shouldDisplayLoans: true
        };
    },
    props: {
        loans: Array
    },
    template: `
        <div class="card fluid">
            <div v-if="loans.length > 0">
                <button v-on:click="shouldDisplayLoans = !shouldDisplayLoans">{{ shouldDisplayLoans ? 'Hide' : 'Show' }} Loans</button>
                <div v-if="shouldDisplayLoans">
                    <table id="loans-table">
                        <thead>
                            <th class="loans-table-name-column">Name</th>
                            <th class="loans-table-principal-column">Principal</th>
                            <th class="loans-table-interest-column">Interest</th>
                            <th class="loans-table-minimum-column">Minimum</th>
                            <th class="loans-table-delete-column"></th>
                        </thead>
                        <tr v-for="loan in loans">
                            <td data-label="Name">{{ loan.name }}</td>
                            <td data-label="Principal">{{ loan.principal | currency }}</td>
                            <td data-label="Interest">{{ loan.interest }}%</td>
                            <td data-label="Minimum">{{ loan.minimum | currency }}</td>
                            <td><button class="secondary" v-on:click="$emit('delete', loan)">Delete</button></td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    `
});

export { Loans };