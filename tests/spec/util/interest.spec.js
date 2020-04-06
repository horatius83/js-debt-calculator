// import { calculateNewPrincipal, calculateNewPrincipalForMonth, getMinimumMonthlyPayment } from '../../../app/models/util/interest';

describe('interest utility module', () => {
    describe('calculateNewPrincipal', () => {
        it('should calculate correctly', () => {
            const principal = 10000;
            const rateInPercent = 10;
            const timeInYears = 5;
            const rate = rateInPercent / 100.0;
            const expectedValue = principal * (1.0 + rate * timeInYears);

            const result = calculateNewPrincipal(principal, rateInPercent, timeInYears);

            expect(result).toBeCloseTo(expectedValue);
        });
    });
    describe('calculateNewPrincipalForMonth', () => {
        it('should calculate correctly', () => {
            const principal = 10000;
            const rateInPercent = 10;
            const timeInYears = 1/12.0;
            const expectedValue = calculateNewPrincipal(principal, rateInPercent, timeInYears);

            const result = calculateNewPrincipalForMonth(principal, rateInPercent);

            expect(result).toBeCloseTo(expectedValue);
        })
    });
    describe('getMinimumMonthlyPayment', () => {
        it('should return the minimum if the interest is less than the minimum', () => {
            const principal = 10000;
            const rateInPercent = 10;
            const newPrincipal = calculateNewPrincipalForMonth(principal, rateInPercent);
            const interest = newPrincipal - principal;
            const minimum = interest + 2;

            const result = getMinimumMonthlyPayment(principal, rateInPercent, minimum);

            expect(result).toBeCloseTo(minimum);
        });
        it('should return the interest if the minimum is less than the interest', () => {
            const principal = 10000;
            const rateInPercent = 10;
            const newPrincipal = calculateNewPrincipalForMonth(principal, rateInPercent);
            const interest = newPrincipal - principal;
            const minimum = interest - 2;

            const result = getMinimumMonthlyPayment(principal, rateInPercent, minimum);

            expect(result).toBeCloseTo(interest);
        });
    });
})