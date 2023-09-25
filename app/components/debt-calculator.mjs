import { Loan } from "../modules/paymentPlan.mjs";

class NewLoanState {
    constructor() {
        this.name = "";
        this.principal = "";
        this.interest = "";
        this.minimum = "";
    }
}

const MAX_YEARS = 20;

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
        this.paymentPeriodInYears = MAX_YEARS;
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
        loans.splice(index, 1);
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
            return accounting.formatMoney(value);
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
            debugger;
            const loan = getLoan(
                this.newLoan.name, 
                this.newLoan.principal, 
                this.newLoan.interest, 
                this.newLoan.minimum);
            if (loan) {
                this.loans.push(loan);
                this.clear();
            }
        },

        clear() {
            this.newLoan.name = ""; 
            this.newLoan.principal = ""; 
            this.newLoan.interest = "";
            this.newLoan.minimum = "";
        }
    },
    computed: {
        /**
         * @returns {number} - the sum of all the principal amounts
         */
        totalPrincipal: function() {
            return this.loans.map(x => x.principal).reduce((acc, x) => acc + x, 0);
        },
        /**
         * @returns {number} - the minimum payment required every month
         */
        totalMinimum: function() {
            return this.loans.map(x => x.minimum).reduce((acc, x) => acc + x, 0);
        }
    },
    template: 
/* html */`
<div class="container">
    <header>
        <h2>Debt Calculator</h2>
    </header>
    <div class="container" id="loans-table">
        <table id="loans-table" class="table table-striped">
            <thead>
                <th class="loans-table-name-column">Name</th>
                <th class="loans-table-principal-column">Principal</th>
                <th class="loans-table-interest-column">Interest</th>
                <th class="loans-table-minimum-column">Minimum</th>
                <th class="loans-table-delete-column"></th>
            </thead>
            <tbody class="table-group-divider">
                <tr v-for="loan in loans">
                    <td data-label="Name">{{ loan.name }}</td>
                    <td data-label="Principal">{{ asCurrency(loan.principal) }}</td>
                    <td data-label="Interest">{{ asPercentage(loan.interest) }}</td>
                    <td data-label="Minimum">{{ asCurrency(loan.minimum) }}</td>
                    <td>
                        <div class="btn-group d-flex justify-content-end" role="group">
                            <button type="button" class="btn btn-secondary">Edit</button>
                            <button type="button" class="btn btn-danger" v-on:click="removeLoan(loan.name)">Delete</button>
                        </div>
                    </td>
                </tr>
            </tbody>
            <tfoot class="table-group-divider">
                <td>Total</td>
                <td>{{ asCurrency(totalPrincipal) }}</td>
                <td /> 
                <td>{{ asCurrency(totalMinimum) }}</td>
                <td>
                    <div class="btn-group d-flex justify-content-end">
                        <button type="button" class="btn btn-success">
                            Save Loans 
                        </button>
                        <button type="button" class="btn btn-info">
                            Load Loans 
                        </button>
                        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#new-loan-modal">
                            Add New Loan 
                        </button>
                    </div>
                </td>
            </tfoot>
        </table>
    </div>
    <div class="container">
        <div class="mb-3">
            <label for="avalanche-select" class="form-label">Payment Strategy</label>
            <select class="form-select" aria-label="Strategy Selection" id="avalanche-select">
                <option value="avalanche" selected>Avalanche (Highest Interest First)</option>
                <option value="snowball">Snowball (Lowest Principal First)</option>
            </select>
            <label for="total-monthly-payment" class="form-label">Total Monthly Payment</label>
            <input class="form-control" type="text" id="total-monthly-payment">
            <label for="years-range" class="form-label">Maximum Months to Pay Off Loans</label>
            <input type="range" class="form-range" min="3" max="240" step="3" id="years-range">
            <div class="col mb-3 btn-group">
                <button type="button" class="btn btn-success">
                    Generate Payment Plan 
                </button>
            </div>
        </div>
    </div>

    <!-- New Loan Popup -->
    <div class="modal" tabindex="-1" id="new-loan-modal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">New Loan</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <input 
                            class="form-control"
                            name="new-loan-name" 
                            id="new-loan-name" 
                            v-model="newLoan.name" 
                            required="required" 
                            placeholder="Name"
                        >
                    </div>
                    <div class="input-group mb-3">
                        <span class="input-group-text">$</span>
                        <input 
                            class="form-control"
                            name="new-loan-principal" 
                            v-model="newLoan.principal" 
                            placeholder="Principal"
                        >
                    </div>
                    <div class="input-group mb-3">
                        <input 
                            class="form-control"
                            name="new-loan-interest" 
                            id="new-loan-interest" 
                            v-model="newLoan.interest" 
                            placeholder="Interest"
                        >
                        <span class="input-group-text">%</span>
                    </div>
                    <div class="input-group mb-3">
                        <span class="input-group-text">$</span>
                        <input 
                            class="form-control"
                            name="new-loan-minimum" 
                            id="new-loan-minimum" 
                            v-model="newLoan.minimum" 
                            placeholder="Minimum"
                        >
                    </div>            
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal" v-on:click="addLoan">Save changes</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" v-on:click="clear">Close</button>
                </div>
            </div>
        </div>
    </div>
</div>
`
};