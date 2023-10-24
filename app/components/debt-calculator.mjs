import { DebtCalculatorState } from "../modules/debtCalculatorState.mjs";
import { getMinimumMonthlyPaymentWithinPeriod } from "../modules/interest.mjs";
import { avalancheRepayment, PaymentPlan } from "../modules/paymentPlan.mjs";
import { debounce, deleteItem, getLoan } from "../modules/util.mjs";
import { html } from "./debt-calculator-html.mjs";

const MAX_YEARS = 20;

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
         * Convert number of months into a string of years and months
         * @param {number} months
         * @returns {string} - X years Y months
         */
        asYearsAndMonths(months) {
            const years = Math.floor(months / 12);
            const remainingMonths = months % 12;
            const yearsLabel = years !== 1 ? 'years' : 'year';
            const monthsLabel = remainingMonths !== 1 ? 'months': 'month';
            if (years === 0) {
                return `${remainingMonths} ${monthsLabel}`;
            }
            if (remainingMonths === 0) {
                return `${years} ${yearsLabel}`
            }
            return `${years} ${yearsLabel} ${remainingMonths} ${monthsLabel}`;
        },

        /**
         * Delete a Loan
         * @param {string} loanName - name of the loan
         */
        removeLoan(loanName) {
            this.loans = deleteItem(this.loans, x => x.name == loanName);
        },

        addLoan() {
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

        validateTotalMonthlyPayment: debounce(function() {
            if (!this.totalMonthlyPayment || this.totalMonthlyPayment < this.totalMinimum) {
                this.$refs.totalMonthlyPaymentInputRef.classList.add('is-invalid');
            } else {
                this.$refs.totalMonthlyPaymentInputRef.classList.remove('is-invalid');
            }
        }),
        validateNewLoanName: debounce(function() {
            if (!this.newLoan.name) {
                this.$refs.newLoanNameRef.classList.add('is-invalid');
            } else {
                this.$refs.newLoanNameRef.classList.remove('is-invalid');
            }
        }),
        validateNewLoanPrincipal: debounce(function() {
            const p = Number(this.newLoan.principal);
            if (p === NaN || p <= 0) {
                this.$refs.newLoanPrincipalRef.classList.add('is-invalid');
            } else {
                this.$refs.newLoanPrincipalRef.classList.remove('is-invalid');
            }
        }),
        validateNewLoanInterest: debounce(function() {
            const i = Number(this.newLoan.interest);
            if (i === NaN || i < 0) {
                this.$refs.newLoanInterestRef.classList.add('is-invalid');
            } else {
                this.$refs.newLoanInterestRef.classList.remove('is-invalid');
            }
        }),
        validateNewLoanMinimum: debounce(function() {
            const m = Number(this.newLoan.minimum);
             if (m === NaN || m < 0) {
                this.$refs.newLoanMinimumRef.classList.add('is-invalid');
            } else {
                this.$refs.newLoanMinimumRef.classList.remove('is-invalid');
            }
        }),
        clear() {
            for (const x of ['name', 'principal', 'interest', 'minimum']) {
                this.newLoan[x] = "";
            }

            for (const r of ['Name', 'Principal', 'Interest', 'Minimum']) {
                this.$refs[`newLoan${r}Ref`].classList.remove('is-invalid');
            }
        },
        generatePaymentPlan() {
            this.paymentPlan = new PaymentPlan(this.loans, this.paymentPeriodInMonths / 12.0, avalancheRepayment);
        }
    },
    computed: {
        /**
         * @returns {number} - the sum of all the principal amounts
         */
        totalPrincipal: function() {
            return this.loans
            .map(x => x.principal)
            .reduce((acc, x) => acc + x, 0);
        },
        /**
         * @returns {number} - the minimum payment required every month
         */
        totalMinimum: function() {
            const r = this.loans
            .map(x => getMinimumMonthlyPaymentWithinPeriod(x.principal, x.interest / 100.0, x.minimum, this.paymentPeriodInMonths / 12.0))
            .reduce((acc, x) => acc + x, 0);
            return r;
        },
        totalMinimumToNearestDollar: function() {
            return Math.ceil(this.totalMinimum);
        },
        maxMonths: () => MAX_YEARS * 12,
        totalMonthlyPayment() {
            return Number(this.totalMonthlyPaymentInput);
        },
        cannotAddNewLoan() {
            const newLoan = getLoan(
                this.newLoan.name, 
                this.newLoan.principal,
                this.newLoan.interest,
                this.newLoan.minimum
            );
            return newLoan === undefined;
        }
    },
    template: html
};