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
    const p = parseValue(principal);
    const m = parseValue(minimum);
    const i = Number(interest) / 100.0;
    if (!Number.isNaN(p) && !Number.isNaN(i) && !Number.isNaN(m) && !!name) {
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
 * @returns { number } - the numeric value of the number or NaN if not possible
 */
export const parseValue = (v) => parseFloat(v.replace(/[$,]/g, ''));


/**
 * Download a JSON file to the local file system
 * @param {string} filename - name of the file to save
 * @param {string} data - data as a string
 */
export const downloadFile = (filename, data) => {
    const link = document.createElement('a');
    const file = new Blob([data], {type: 'application/json'});
    link.href = URL.createObjectURL(file);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
};

/**
 * Convert utf-8 text into base-64
 * @param {string} text - text to encode
 * @returns {string} - represents the string encoded in base64
 */
export const textToBase64 = (text) => {
    const bytes = new TextEncoder().encode(text);
    const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
    return btoa(binString);
}

/**
 * Convert a base64 string into a utf-8 string
 * @param {string} b64text - string in base64
 * @returns {string} - string in utf-8
 */
export const base64ToText = (b64text) => {
    const binString = atob(b64text);
    const byteArray = Uint8Array.from(binString, (m, _) => m.codePointAt(0));
    return new TextDecoder().decode(byteArray);
}