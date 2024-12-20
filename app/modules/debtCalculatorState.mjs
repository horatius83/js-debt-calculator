import { Loan } from "./loan.mjs";
import { PaymentPlan } from "./paymentPlan.mjs";
import { usd } from "./util.mjs";

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
        this.loans = [
            /*
            new Loan("Monroe and Main", usd(60.36), 0.21, usd(20.0)),
            new Loan("Blair", usd(124.87), 0.2724, usd(51)),
            new Loan("Chase Slate", usd(1549.03), 0.2999, usd(51)),
            new Loan("JC Penny", usd(2460.37), 0.2699, usd(99.24)),
            new Loan("ExxonMobil", usd(1478.91), 0.2524, usd(46.70)),
            new Loan("Home Depot", usd(1098.21), 0.2599, usd(37)),
            new Loan("Sam's Club", usd(6717.28), 0.2315, usd(199)),
            new Loan("Chevron / Texaco", usd(1790.62), 0.2724, usd(59)),
            new Loan("Woman Within", usd(1116.68), 0.2724, usd(50)),
            new Loan("Dillards", usd(6228.85), 0.2224, usd(170)),
            new Loan("Spruce / Viewtech Financial", usd(4822.99), 0, usd(202.96)),
            new Loan("Ginny's", usd(433.74), 0.21, usd(30)),
            new Loan("Walmart", usd(3872.16), 0.1715, usd(94)),
            new Loan("Military Star", usd(799.68), 0.1049, usd(45)),
            new Loan("Sears", usd(3797.66), 0.2544, usd(122))
            */
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