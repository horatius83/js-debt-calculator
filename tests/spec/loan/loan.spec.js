import { Loan } from '../../../app/models/loan/loan.js';
import { getMinimumMonthlyPayment } from '../../../app/models/util/interest.js';

describe('loan.model', () => {
  it('should be created', () => {
    const loan = new Loan('Test', 5000, 10, 50);
    expect(loan).toBeTruthy();
  });

  it('should create the correct loan', () => {
    const name = 'test loan';
    const principal = 5000.0;
    const interest = 10.0;
    const minimum = 50.0;

    let resultingLoan = new Loan(name, principal, interest, minimum);

    expect(resultingLoan.name).toEqual(name);
    expect(resultingLoan.principal).toBeCloseTo(principal); 
    expect(resultingLoan.interest).toBeCloseTo(interest);
    expect(resultingLoan.minimum).toBeCloseTo(minimum);
  });

  it('should calculate the minimum monthly payment correctly', () => {
    const name = 'test loan';
    const principal = 5000.0;
    const interest = 10.0;
    const minimum = 50.0;
    let loan = new Loan(name, principal, interest, minimum);
    const expectedMonthlyPayment = getMinimumMonthlyPayment(principal, interest, minimum)

    const minimumMonthlyPayment = loan.getMinimumPayment();

    expect(minimumMonthlyPayment).toBeCloseTo(expectedMonthlyPayment);
  });
});