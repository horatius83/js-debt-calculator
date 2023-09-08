/**
 * Round a number x to a number of decimal places
 * @param {number} x - the number to be rounded
 * @param {number} places - decimal places to round to
 */
export function round(x, places) {
    const y = Math.pow(10, places);
    return Math.round(x * y) / y;
}