import { Loan } from "./paymentPlan.mjs";

/**
 * Delete an item from an array
 * @param {[any]} array 
 * @param {(_: any) => boolean} predicate 
 */
export function deleteItem(array, predicate) {
    const index = array.findIndex(predicate);
    if (index >= 0) {
        array.splice(index, 1);
    }
    return array;
}

/**
 * Attempt to create a loan from a name, principal, interest, and minimum value
 * @param {string} name - the name of the loan
 * @param {string} principal - the amount of money owed on the loan
 * @param {string} interest - the interest on the loan
 * @param {string} minimum - the minimum monthly payment on the loan
 * @returns {Loan | undefined} - Either a Loan if the values are valid or undefined
 */
export function getLoan(name, principal, interest, minimum) {
    const p = Number(principal);
    const i = Number(interest);
    const m = Number(minimum);
    if (p !== NaN && i !== NaN && m !== NaN && name) {
        return new Loan(name, p, i, m);
    }
}

/**
 * Set a function call after a certain number of ms after the last time the function is called
 * @param {() => void} func - function to execute after an amount of time has passed
 * @param {number=} timeoutInMs - time in ms to wait before executing the function
 * @returns {() => void}
 */
export function debounce(func, timeoutInMs=300) {
    let timer;
    return function() {
        clearTimeout(timer);
        var that = this;
        timer = setTimeout(function() {
            func.apply(that);
        }, timeoutInMs);
    };
}