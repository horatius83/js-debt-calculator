import Dinero from 'dinero.js'

/**
 * Calculate the minimum payment needed to pay off a loan within the time period specified
 * @param {Dinero.Dinero} principal - the principal of the loan
 * @param {number} interestRatePerPeriod - the interest rate per period (per month would be APR / 12)
 * @param {number} numberofPeriods - number of periods (per month would be year * 12)
 * @returns {Dinero.Dinero} - payment amount per period to pay off the loan
 */
export function getLoanPaymentAmount(principal, interestRatePerPeriod, numberofPeriods) {
    if (interestRatePerPeriod == 0) {
        return principal.divide(numberofPeriods);
    }
    const numerator = principal.multiply(interestRatePerPeriod);
    const denominator = 1 - Math.pow(1 + interestRatePerPeriod, -1.0 * numberofPeriods);
    return numerator.divide(denominator);
}

/**
 * Get the minimum payment needed to pay off a loan within a certain number of years
 * @param {Dinero.Dinero} principal - the amount owed
 * @param {number} interest - the APR as a fraction (so 10% -> 0.1)
 * @param {Dinero.Dinero} minimumPayment - the minimum payment on the bill
 * @param {number} years - the maximum number of years to pay off loans
 */
export const getMinimumMonthlyPaymentWithinPeriod = (principal, interest, minimumPayment, years) => 
    Dinero.minimum([
        getPrincipalPlusMonthlyInterest(principal, interest),
        Dinero.maximum([
            getLoanPaymentAmount(principal, interest / 12.0, 12 * years),
            minimumPayment
        ])
    ]);

/**
 * Get principal plus monthly interest
 * @param {Dinero.Dinero} principal 
 * @param {number} interest 
 * @returns {Dinero.Dinero}
 */
export const getPrincipalPlusMonthlyInterest = (principal, interest) => principal.add(principal.multiply(interest / 12.0));



