// @ts-check
import { Loan } from "./loan.mjs";
import { PaymentPlan } from "./paymentPlan.mjs";

export class NewLoanState {
    constructor() {
        /** @type {string} */this.name = "";
        /** @type {string} */this.principal = "";
        /** @type {string} */this.interest = "";
        /** @type {string} */this.minimum = "";
    }
}

export class EditLoanState {
    constructor() {
        /** @type {string} */this.name = "";
        /** @type {string} */this.principal = "";
        /** @type {string} */this.interest = "";
        /** @type {string} */this.minimum = "";
        /** @type {number} */this.index = -1;
    }
}

export class DebtCalculatorState {
    constructor() {
        /** @type {Array<Loan>} */
        // this.loans = []
        this.loans = [];
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
        /** @type { string } */
        this.strategy = "avalanche";
        /** @type { boolean } */
        this.shouldCreateEmergencyFund = false;
        /** @type { number } */
        this.emergencyFundMaxAmount = 3000 * 6;
        /** @type { string} */
        this.emergencyFundMaxAmountErrorMessage = '';
        /** @type { number } */
        this.emergencyFundPercentage = 50;
        /** @type { string } */
        this.emergencyFundPercentageErrorMessage = '';
    }
}