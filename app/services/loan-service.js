import { Loan } from '../models/loan/loan.js';
import { avalanche, snowball, double } from '../models/loan/paymentStrategy.js';
import { Payment } from '../models/loan/payment.js';

const loanServiceKey = 'debt-calculator-loans';

function toBinary(string) {
    const codeUnits = new Uint16Array(string.length);
    for(let i=0; i<codeUnits.length; i++) {
        codeUnits[i] = string.charCodeAt(i);
    }
    return String.fromCharCode(...new Uint8Array(codeUnits.buffer));
}

function fromBinary(binary) {
    const bytes = new Uint8Array(binary.length);
    for(let i=0; i<bytes.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return String.fromCharCode(...new Uint16Array(bytes.buffer));
}

function saveLoans(key, loans) {
    const loansAsString = JSON.stringify(loans);
    const loansAsBase64 = toBinary(loansAsString);
    window.localStorage.setItem(key, loansAsBase64);
}

function getLoans(key) {
    const loansAsBase64 = window.localStorage.getItem(key);
    if(loansAsBase64 === null) {
        return [];
    }
    const loansAsString = fromBinary(loansAsBase64);
    const loanAsArrayOfStructs = JSON.parse(loansAsString);
    return loanAsArrayOfStructs.map(x => new Loan(x.name, x.principal, x.interest, x.minimum));
}

class LoanService {
    constructor() {
        /*
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
        */
       this.loans = getLoans(loanServiceKey);
        this.paymentStategies = {
            avalanche: {name: 'avalanche', displayName: 'Avalanche', strategy: avalanche},
            snowball: {name: 'snowball', displayName: 'Snowball', strategy: snowball},
            double: {name: 'double', displayName: 'Double-Double', strategy: double}
        };
        this.paymentStrategy = this.paymentStategies['avalanche'];
        this.totalMonthlyPayment = 0;
    }

    getLoans() {
        return this.loans;
    }

    addLoan(loan) {
        this.loans.push(loan);
        saveLoans(loanServiceKey, this.loans);
    }

    deleteLoan(loan) {
        const index = this.loans
            .reduce((j, x, i) => x.name == loan.name ? i : j, -1);
        if(index > -1) {
            this.loans.splice(index,1);
        }
        saveLoans(loanServiceKey, this.loans);
    }

    setPaymentStrategy(strategy) {
        this.paymentStrategy = this.paymentStategies[strategy];
    }

    getPaymentStrategy() {
        return this.paymentStrategy;
    }

    getPaymentStrategies() {
        return this.paymentStategies;
    }

    getTotalMonthlyPayment(payment) {
        return this.totalMonthlyPayment;
    }

    setTotalMonthlyPayment(payment) {
        this.totalMonthlyPayment = payment;
    }

    getMinimumMonthlyPayment(date) {
        if(!date) {
            date = new Date();
        }
        const payments = this.loans
            .map(ln => new Payment(ln, ln.principal, 0, date))
            .map(p => p.getMinimumMonthlyPayment(date));
        return payments.reduce((acc, x) => acc + x.amountPaid, 0);
    }
}

var loanService = new LoanService();

export { loanService }