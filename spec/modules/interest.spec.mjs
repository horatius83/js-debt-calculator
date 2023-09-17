import { getLoanPaymentAmount, getMinimumMonthlyPaymentWithinPeriod } 
from '../../app/modules/interest.mjs';

describe('interest', () => {
    describe('getLoanPaymentAmount', () => {
        it('should calculate loan payment amount', () => {
            const n = 5 * 12; // 5 years at 12 periods per year
            const pv = 1000; // $1000
            const r = 0.1 / 12.0; // APR of 10% divided by 12 months
            const payment = (r * pv) / (1 - Math.pow(1 + r, -n));

            const result = getLoanPaymentAmount(pv, r, n);

            expect(result).toBeCloseTo(payment);
        })
    }),
    describe('getMinimumMonthlyPaymentWithinPeriod', () => {
        it('should get calculated payment if it is greater than minimum', () => {
            const years = 5;
            const principal = 1000;
            const interest = 0.1; // 10% APR
            const minimum = 0;
            const payment = ((interest / 12.0) * principal) / (1 - Math.pow(1 + (interest / 12.0), years * -12.0));

            const result = getMinimumMonthlyPaymentWithinPeriod(principal, interest, minimum, years);

            expect(result).toBeCloseTo(payment);
        }),
        it('should get minimum if the calculated payment is less than minimum', () => {
            const years = 5;
            const principal = 1000;
            const interest = 0.1; // 10% APR
            const minimum = 500;

            const result = getMinimumMonthlyPaymentWithinPeriod(principal, interest, minimum, years);

            expect(result).toBeCloseTo(minimum);
        })
    })
})