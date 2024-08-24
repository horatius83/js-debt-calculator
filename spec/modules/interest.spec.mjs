import { getLoanPaymentAmount, getMinimumMonthlyPaymentWithinPeriod } 
from '../../app/modules/interest.mjs';
import { usd, zero } from '../../app/modules/util.mjs';

describe('interest', () => {
    describe('getLoanPaymentAmount', () => {
        it('should calculate loan payment amount', () => {
            const n = 5 * 12; // 5 years at 12 periods per year
            const pv = usd(1000); // $1000
            const r = 0.1 / 12.0; // APR of 10% divided by 12 months
            //const payment = (r * pv) / (1 - Math.pow(1 + r, -n));
            const payment = pv.multiply(r).divide(1 - Math.pow(1 + r, -n));

            const result = getLoanPaymentAmount(pv, r, n);

            expect(result.equalsTo(payment)).toBeTrue();
        })
    }),
    describe('getMinimumMonthlyPaymentWithinPeriod', () => {
        it('should get calculated payment if it is greater than minimum', () => {
            const years = 5;
            const principal = usd(1000);
            const interest = 0.1; // 10% APR
            const minimum = zero;
            const payment = principal.multiply(interest / 12.0).divide(1 - Math.pow(1 + (interest / 12.0), years * -12.0));

            const result = getMinimumMonthlyPaymentWithinPeriod(principal, interest, minimum, years);

            expect(result.equalsTo(payment)).toBeTrue();
        }),
        it('should get minimum if the calculated payment is less than minimum', () => {
            const years = 5;
            const principal = usd(1000);
            const interest = 0.1; // 10% APR
            const minimum = usd(500);

            const result = getMinimumMonthlyPaymentWithinPeriod(principal, interest, minimum, years);

            expect(result.equalsTo(minimum)).toBeTrue();
        }),
        it('should calculate zero interest rates correctly', () => {
            const years = 5;
            const principal = usd(1000);
            const interest = 0;
            const payment = principal.divide(years * 12.0);
            const minimum = zero;

            const result = getMinimumMonthlyPaymentWithinPeriod(principal, interest, minimum, years);

            expect(result.equalsTo(payment)).toBeTrue();
        })
    })
})