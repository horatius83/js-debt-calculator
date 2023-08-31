/**
 * Calculate the minimum payment needed to pay off a loan within the time period specified
 * @param {number} principal - the principal of the loan
 * @param {number} ratePerPeriod - the interest rate per period (per month would be APR / 12)
 * @param {number} numberofPeriods - number of periods (per month would be year * 12)
 * @returns {number} - payment amount per period to pay off the loan
 */
export function getLoanPaymentAmount(principal, ratePerPeriod, numberofPeriods) {
    return (ratePerPeriod * principal) / (1 - Math.pow(1 + ratePerPeriod, -1.0 * numberofPeriods));
}

/**
 * Get the minimum payment needed to pay off a loan within a certain number of years
 * @param {number} principal 
 * @param {number} interest 
 * @param {number} minimumPayment 
 * @param {number} years 
 */
export function getMinimumMonthlyPaymentWithinPeriod(principal, interest, minimumPayment, years) {
    return Math.max(
        getLoanPaymentAmount(principal, interest / 12.0, 12 * years),
        minimumPayment
    );
}
