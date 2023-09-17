import { Loan } from "../modules/paymentPlan.mjs";
import { LoanService } from "../services/loan-service.mjs";

class NewLoanState {
    constructor() {
        this.name = "";
        this.principal = "";
        this.interest = "";
        this.minimum = "";
    }
}

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
        this.newLoan = new NewLoanState();
    }
}

/**
 * Delete a loan by name
 * @param {string} loanName - the name of the loan
 * @param {Loan[]} loans - an array of loans that may contain a loan with the loan name
 * @returns {Loan[]} - Either the loans array without loan or the original array if loan was not found
 */
function deleteLoan(loanName, loans) {
    const index = loans.findIndex(x => x.name === loanName);

    if (index >= 0) {
        loans.splice(index, 2);
    }
    return loans;
}

/**
 * Attempt to create a loan from a name, principal, interest, and minimum value
 * @param {string} name - the name of the loan
 * @param {string} principal - the amount of money owed on the loan
 * @param {string} interest - the interest on the loan
 * @param {string} minimum - the minimum monthly payment on the loan
 * @returns {Loan | undefined} - Either a Loan if the values are valid or undefined
 */
function getLoan(name, principal, interest, minimum) {
    const p = Number(principal);
    const i = Number(interest);
    const m = Number(minimum);
    if (p && i && m && name) {
        return new Loan(name, p, i, m);
    }
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
            const x = Math.round(value * 100)
            const y = x / 100.0;
            return `$${y.toFixed(2)}`;
        },
        /**
         * Format a value as a percentage
         * @param {number} value 
         * @returns {string}
         */
        asPercentage(value) {
            return `${value.toFixed(2)}%`;
        },
        /**
         * Delete a Loan
         * @param { string } loanName - name of th eloan
         */
        removeLoan(loanName) {
            this.loans = deleteLoan(loanName, this.loans);
        },

        addLoan() {
            const loan = getLoan(
                this.newLoan.name, 
                this.newLoan.principal, 
                this.newLoan.interest, 
                this.newLoan.minimum);
            if (loan) {
                this.loans.push(loan);
            }
        }
    },
    template: 
/* html */`
<div>
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
    <div id="summary" class="card fluid">
        <label for="new-loan-name">Name</label>
        <input 
            name="new-loan-name" 
            id="new-loan-name" 
            v-model="newLoan.name" 
            required="required" 
        >
        <label for="new-loan-principal">Principal</label>
        <input 
            name="new-loan-principal" 
            v-model="newLoan.principal" 
        >
        <label for="new-loan-interest">Interest</label>
        <input 
            name="new-loan-interest" 
            id="new-loan-interest" 
            v-model="newLoan.interest" 
        >
        <label for="new-loan-minimum">Minimum</label>
        <input 
            name="new-loan-minimum" 
            id="new-loan-minimum" 
            v-model="newLoan.minimum" 
        >
        <div class="row">
            <button class="primary" v-on:click="addLoan">Create New Loan</button>
            <button class="secondary" v-on:click="clear()">Cancel</button>
        </div>
    </div>
</div>
`
};