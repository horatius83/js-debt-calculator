/**
 * Calculate the new principal of a loan using the simple interst formula
 * @param {number} principal - the amount of the loan
 * @param {number} rateInPercent - the interest rate (10%, 15%, etc)
 * @param {number} timeInYears - the number of years
 * @returns {number} the principal + any interest that has accrued
 */
export function calculateNewPrincipal(principal, rateInPercent, timeInYears) {
    let rate = rateInPercent / 100.0;
    return principal * (1.0 + rate * timeInYears);
}

/**
 * Get the new principal after calculating one month of interest
 * @param {number} principal - the amount of the loan
 * @param {number} interest - the interest rate (decmial)
 * @returns {number} - the new principal amount after adding the interest
 */
export function calculateNewPrincipalForMonth(principal, interest) {
    return calculateNewPrincipal(principal, interest, 1.0/12.0);
}

/**
 * Get the minimum monthly payment
 * @param {number} principalRemaining - the amount left on the loan
 * @param {number} interest - the interest rate (decimal)
 * @param {number} minimumPayment - the minimum payment specified on the loan
 */
export function getMinimumMonthlyPayment(principalRemaining, interest, minimumPayment){
    const newPrincipal = calculateNewPrincipalForMonth(principalRemaining, interest);
    const minimumInterestPayment = newPrincipal - principalRemaining;
    const minimum = Math.max(minimumInterestPayment, minimumPayment);
    if(minimum < principalRemaining) {
        return minimum;
    } else {
        return principalRemaining;
    }
}

/**
 * Calculate the minimum payment needed to pay off a loan within the time period specified
 * @param {number} presentValue - the present value of the loan
 * @param {number} ratePerPeriod - the interest rate per period (per month would be APR / 12)
 * @param {number} numberofPeriods - number of periods (per month would be year * 12)
 * @returns {number} - payment amount per period to pay off the loan
 */
export function getLoanPaymentAmount(presentValue, ratePerPeriod, numberofPeriods) {
    return (ratePerPeriod * presentValue) / (1 - Math.pow(1 + ratePerPeriod, -1.0 * numberofPeriods));
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
