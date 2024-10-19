import { Loan } from "./loan.mjs";
import Dinero from 'dinero.js'

export const zero = Dinero({amount: 0});
/**
 * Return a number as USD
 * @param {number} amount in dollars
 * @returns {Dinero.Dinero}
 */
export const usd = (amount) => Dinero({ amount: amount * 100 });

export const moneyFormat = '$0,0.00';

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
    if (!Number.isNaN(p) && !Number.isNaN(i) && !Number.isNaN(m) && name) {
        return new Loan(name, usd(p), i, usd(m));
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

/**
 * Parse a string value representing a currency into a numeric value
 * @param {string} v - value in the form of $12,345.67
 * @returns { number | undefined } - the numeric value of the number or undefined if not possible
 */
export const parseValue = (v) => parseFloat(v.replace(/[$,]/g, ''));