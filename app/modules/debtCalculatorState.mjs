import { Loan, PaymentPlan } from "./paymentPlan.mjs";

export class NewLoanState {
    constructor() {
        this.name = "";
        this.principal = "";
        this.interest = "";
        this.minimum = "";
    }
}

export class EditLoanState {
    constructor() {
        this.name = "";
        this.principal = "";
        this.interest = "";
        this.minimum = "";
        this.loanIndex = -1;
    }
}

export class DebtCalculatorState {
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
        /** @type {NewLoanState} */
        this.newLoan = new NewLoanState();
        /** @type {number} */
        this.paymentPeriodInMonths = 5 * 12;
        /** @type {string} */
        this.totalMonthlyPaymentInput = "";
        /** @type {PaymentPlan|undefined} */
        this.paymentPlan = undefined;
        /** @type { EditLoanState } */
        this.currentEditLoan = new EditLoanState();
    }
}