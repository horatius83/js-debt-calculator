import { Loan } from "../modules/paymentPlan.mjs";
import { LoanService } from "../services/loan-service.mjs";

class DebtCalculatorState {
    constructor() {
        /** @type {Array<Loan>} */
        // this.loans = []
        this.loans = [
            new Loan("Monroe and Main", 60.36, 21.0, 20.0),
            new Loan("Blair", 124.87, 27.24, 51),
            new Loan("Chase Slate", 1549.03, 29.99, 51),
            new Loan("JC Penny", 2460.37, 26.99, 99.24),
            new Loan("ExxonMobil", 1478.91, 25.24, 46.70),
            new Loan("Home Depot", 1098.21, 25.99, 37),
            new Loan("Sam's Club", 6717.28, 23.15, 199),
            new Loan("Chevron / Texaco", 1790.62, 27.24, 59),
            new Loan("Woman Within", 1116.68, 27.24, 50),
            new Loan("Dillards", 6228.85, 22.24, 170),
            new Loan("Spruce / Viewtech Financial", 4822.99, 0, 202.96),
            new Loan("Ginny's", 433.74, 21, 30),
            new Loan("Walmart", 3872.16, 17.15, 94),
            new Loan("Military Star", 799.68, 10.49, 45),
            new Loan("Sears", 3797.66, 25.44, 122)
        ];
    }
}

/**
 * Delete a loan by name
 * @param {string} loanName - the name of the loan
 * @param {Loan[]} loans - an array of loans that may contain a loan with the loan name
 * @returns {Loan[]} - Either the loans array without loan or the original array if loan was not found
 */
function deleteLoan(loanName, loans) {
    debugger;
    const index = loans.findIndex(x => x.name === loanName);
    if (index >= 0) {
        return loans.splice(index, 1);
    }
    return loans;
}

export const DebtCalculator = {
    data() {
        return new DebtCalculatorState();
    },
    methods: {
        /**
         * Format a value as dollars and cents
         * @param {number} value - 3.14
         * @returns {string} - value formatted as a currency ($3.14)
         */
        asCurrency(value) {
            return `$${value.toFixed(2)}`;
        },
        /**
         * Format a value as a percentage
         * @param {number} value 
         * @returns {string}
         */
        asPercentage(value) {
            return `${value}%`;
        },
        /**
         * Delete a Loan
         */
        removeLoan(loanName) {
            debugger;
            this.loans = deleteLoan(loanName, this.loans);
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
        <td><button class="secondary" v-on:click="removeLoan(loan.name)">Delete</button></td>
    </tr>
</table>
`
};