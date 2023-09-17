import { LoanService } from "../services/loan-service.mjs";

export const DebtCalculator = {
    data() {
        return new LoanService()
    },
    methods: {
        /**
         * Format a value as dollars and cents
         * @param {number} value - 3.14
         * @returns {string} - value formatted as a currency ($3.14)
         */
        asCurrency: (value) => {
            return `$${value.toFixed(2)}`;
        },
        /**
         * Format a value as a percentage
         * @param {number} value 
         * @returns {string}
         */
        asPercentage: (value) => {
            return `${value}%`;
        }
    },
    template: 
/* html */`
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
        <td data-label="Principal">{{ asCurrency(loan.principal) }}</td>
        <td data-label="Interest">{{ asPercentage(loan.interest) }}</td>
        <td data-label="Minimum">{{ asCurrency(loan.minimum) }}</td>
        <td><button class="secondary" v-on:click="$emit('delete', loan)">Delete</button></td>
    </tr>
</table>
`
};