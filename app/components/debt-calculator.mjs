import Dinero from "dinero.js";
import { DebtCalculatorState } from "../modules/debtCalculatorState.mjs";
import { EmergencyFund } from "../modules/emergencyFund.mjs";
import { getMinimumMonthlyPaymentWithinPeriod } from "../modules/interest.mjs";
import { avalancheRepayment, snowballRepayment, PaymentPlan } from "../modules/paymentPlan.mjs";
import { PaymentPlanOutputMonth } from "../modules/paymentPlanOutputMonth.mjs";
import { debounce, deleteItem, getLoan, moneyFormat, parseValue, usd } from "../modules/util.mjs";
import { html } from "./debt-calculator-html.mjs";
import { Loan } from "../modules/loan.mjs";

const MAX_YEARS = 20;

const usdFormatter = Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD' 
});

export const DebtCalculator = {
    data() {
        return new DebtCalculatorState();
    },
    mounted() {
        this.$refs.editLoanModal.addEventListener('show.bs.modal', (/** @type { MouseEvent }*/ event) => {
            const button = /** @type {HTMLElement} */ (event?.relatedTarget);
            const index = Number(button?.getAttribute('data-loan-index'));
            this.openEditLoanDialog(index);
        });
    },
    methods: {
        /**
         * Format a value as dollars and cents
         * @param {Dinero.Dinero} value - 3.14
         * @returns {string} - value formatted as a currency ($3.14)
         */
        asCurrency(value) {
            if (value && value?.toFormat) {
                return value?.toFormat(moneyFormat);
            } else {
                if (!value) {
                    console.error(`asCurrency: value is not valid`);
                } else if (!value?.toFormat) {
                    console.error(`asCurrency: value: ${value} is not valid`);
                }
            }
            return '$0.00';
        },

        /**
         * Format a value as a percentage
         * @param {number} value 
         * @returns {string}
         */
        asPercentage(value) {
            return `${(value * 100).toFixed(2)}%`;
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
         * Convert a date to month / year (December 14th 2024 -> 12 / 2024)
         * @param {Date} d - the date to convert
         * @returns {string} - 
         */
        dateAsYearAndMonth(d) {
           const options = /** @type { DateTimeFormatOptions }*/{ month: 'long', year: "numeric"};
           const formatter = new Intl.DateTimeFormat('en-US', options);
           return formatter.format(d);
        },

        /**
         * Delete a Loan
         * @param {string} loanName - name of the loan
         */
        removeLoan(loanName) {
            this.loans = deleteItem(this.loans, x => x.name == loanName);
        },

        /**
         * Open the edit loan dialog
         * @param {number} loanIndex 
         */
        openEditLoanDialog(loanIndex) {
            if (loanIndex >= 0 && loanIndex < this.loans.length) {
                /** @type { Loan } */ const loan = this.loans[loanIndex];
                this.currentEditLoan.name = loan.name;
                this.currentEditLoan.principal = this.asCurrency(loan.principal);
                this.currentEditLoan.interest = String(loan.interest * 100.0);
                this.currentEditLoan.minimum = this.asCurrency(loan.minimum);
                this.currentEditLoan.index = loanIndex;
            } else {
                console.error(`openEditLoanDialog: Loan index ${loanIndex} is invalid`)
            }
        },

        /**
         * Edit the loan
         * @param {number} loanIndex 
         */
        editLoan(loanIndex) {
            if (loanIndex >= 0) {
                // Set the loan data
                /** @type { Loan } */const loan = this.loans[loanIndex];
                loan.principal = usd(parseValue(this.currentEditLoan.principal));
                loan.interest = Number(this.currentEditLoan.interest) / 100.0;
                loan.minimum = usd(parseValue(this.currentEditLoan.minimum));
                this.clearEdit();
            } else {
                console.error(`editLoan: Loan index ${loanIndex} is invalid`)
            }           
        },

        clearEdit() {
            // Clear out edit loan information
            this.currentEditLoan.name = "";
            this.currentEditLoan.principal = "";
            this.currentEditLoan.interest = "";
            this.currentEditLoan.minimum = "";
            this.currentEditLoan.index = -1;
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

        /**
         * Validate a number value
         * @param {HTMLElement} element - the element to add or remove the classes to
         * @param {string} value - the value in the form
         * @param { (value: number) => boolean } validator - returns true if valid value
         */
        validateNumber(element, value, validator) {
            const x = Number(value);
            if (Number.isNaN(x) || !validator(x)) {
                element.classList.add('is-invalid');
            } else {
                element.classList.remove('is-invalid');
            }
        },

        validateNewLoanPrincipal: debounce(function() { this.validateNumber(this.$refs.newLoanPrincipalRef, this.newLoan.principal, (x) => x > 0)}),
        validateNewLoanInterest: debounce(function() { this.validateNumber(this.$refs.newLoanInterestRef, this.newLoan.interest, (x) => x >= 0)}),
        validateNewLoanMinimum: debounce(function() { this.validateNumber(this.$refs.newLoanMinimumRef, this.newLoan.minimum, (x) => x >= 0)}),

        validateEditLoanPrincipal: debounce(function() { this.validateNumber(this.$refs.editLoanPrincipalRef, this.currentEditLoan.principal, (x) => x > 0)}),
        validateEditLoanInterest: debounce(function() { this.validateNumber(this.$refs.editLoanInterestRef, this.currentEditLoan.interest, (x) => x >= 0)}),
        validateEditLoanMinimum: debounce(function() { this.validateNumber(this.$refs.editLoanMinimumRef, this.currentEditLoan.minimum, (x) => x >= 0)}),

        validateEmergencyFundPercentage: debounce(function() {
            const element = this.$refs.emergencyFundPercentageRef;
            const number = Number(element.value);
            let hasError = false;
            if (number) {
                if (number < 0) {
                    this.emergencyFundPercentageErrorMessage = 'Percentage cannot be less than 0%'
                    hasError = true;
                } else if (number > 100) {
                    this.emergencyFundPercentageErrorMessage = 'Percentage cannot be above 100%'
                    hasError = true;
                }
            } else {
                this.emergencyFundPercentageErrorMessage = 'Percentage must be a number';
                hasError = true;
            }
            if (hasError) {
                element.classList.add('is-invalid');
            } else {
                element.classList.remove('is-invalid');
            }
        }),

        validateEmergencyFundMaxAmount: debounce(function() {
            const element = this.$refs.emergencyFundMaximumAmountRef;
            const number = Number(element.value);
            if (number) {
                if (number >= 0) {
                    this.emergencyFundMaxAmountErrorMessage = '';
                    element.classList.remove('is-invalid');
                    return
                }
                this.emergencyFundMaxAmountErrorMessage = 'Value must be greater than 0';
            } else {
                this.emergencyFundMaxAmountErrorMessage = 'Value must be a number';
            }
            element.classList.add('is-invalid');
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
            const getStrategy = (/** @type {string} */ s) => {
                switch(s) {
                    case "avalanche": return avalancheRepayment;
                    case "snowball": return snowballRepayment;
                    default: throw Error(`Strategy ${s} not supported`);
                }
            };
            let strategy = getStrategy(this.strategy);

            if (this.shouldCreateEmergencyFund) {
                const emergencyFund = new EmergencyFund(usd(this.emergencyFundMaxAmount), this.emergencyFundPercentage / 100.0);
                const paymentPlan = new PaymentPlan(this.loans, this.paymentPeriodInMonths / 12.0, strategy, emergencyFund);
                this.totalMonthlyPaymentInput = this.totalMonthlyPaymentInput || this.totalMinimumToNearestDollar;
                paymentPlan.createPlan(usd(parseValue(this.totalMonthlyPaymentInput)));
                this.paymentPlan = paymentPlan;
            } else {
                const paymentPlan = new PaymentPlan(this.loans, this.paymentPeriodInMonths / 12.0, strategy);
                this.totalMonthlyPaymentInput = this.totalMonthlyPaymentInput || this.totalMinimumToNearestDollar;
                const tmpi = parseValue(this.totalMonthlyPaymentInput);
                if (tmpi) {
                    paymentPlan.createPlan(usd(tmpi));
                    this.paymentPlan = paymentPlan;
                } else {
                    console.error(`Total Monthly Payment Input was not a number: ${tmpi} (${this.totalMonthlyPaymentInput})`);
                }
            }
        },
        getPaymentPlanSeries() {
            return this.paymentPlan?.getPaymentPlanSeries(new Date());
        },
        updatePlan() {
            this.paymentPlan = undefined;
        },
        getPdf() {
            /** @type { Generator<PaymentPlanOutputMonth>}*/
            const pps = this.paymentPlan?.getPaymentPlanSeries(new Date());
            const content = [];
            for(const payment of pps) {
                content.push({
                    'text': payment.month,
                    'style': 'header'
                })
                for(const loan of payment.loanPayments) {
                    const loanName = loan[0];
                    const amountPaid = loan[1].paid.toFormat(moneyFormat);
                    if (loan[1].paidMoreThanMinimum) {
                        content.push({
                            'style': 'bold',
                            'text': `${loanName}: ${amountPaid}`
                        });
                    } else {
                        content.push(`${loanName}: ${amountPaid}`);
                    }
                }
                if (payment.emergencyFundPayment) {
                    content.push(`Emergency Fund Payment: ${payment.emergencyFundPayment.payment.toFormat(moneyFormat)}`);
                }
                content.push('\n\n');
            }
            const docDefinition = {
                content,
                defaultStyle: {
                    fontFamily: 'Helvetica',
                    fontSize: 12
                },
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true
                    },
                    bold: {
                        fontSize: 15,
                        bold: true
                    }
                }
            };
            pdfMake.fonts = {
                Roboto: {
                    normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
                    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
                    italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
                    bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
                }
            };
            pdfMake.createPdf(docDefinition).download();
        }
    },
    computed: {
        /**
         * @returns {number} - the sum of all the principal amounts
         */
        totalPrincipal: function() {
           return this.loans
           .reduce((acc, ln) => acc.add(ln.principal), Dinero({amount: 0}));
        },
        /**
         * @returns {Dinero.Dinero} - the minimum payment required every month
         */
        totalMinimum: function() {
            const r = this.loans
            .map(x => getMinimumMonthlyPaymentWithinPeriod(x.principal, x.interest, x.minimum, this.paymentPeriodInMonths / 12.0))
            .reduce((acc, x) => acc.add(x), Dinero({amount: 0}));
            return r;
        },
        totalMinimumToNearestDollar: function() {
            return this.totalMinimum.toFormat(moneyFormat);
        },
        maxMonths: () => MAX_YEARS * 12,
        totalMonthlyPayment() {
            return Number(this.totalMonthlyPaymentInput);
        },
        cannotAddNewLoan() {
            try {
                const loan = getLoan(
                    this.newLoan.name, 
                    this.newLoan.principal, 
                    this.newLoan.interest,
                    this.newLoan.minimum,
                );
                return !!loan;
            } catch(e) {
                return true;
            }
        },
        cannotEditLoan() {
            try {
                const loan = getLoan(
                    this.currentEditLoan.name, 
                    this.currentEditLoan.principal, 
                    this.currentEditLoan.interest,
                    this.currentEditLoan.minimum,
                );
                return !!loan;
            } catch(e) {
                return true;
            }
        }
    },
    template: html
};