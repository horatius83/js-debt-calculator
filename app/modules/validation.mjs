/**
 * Check if value is defined and not less then 0, if not then throw error message
 * @param {number} n - the value to check
 * @param {string} description - description of the value being checked
 * @returns {number}
 */
export const mustBeGreaterThanOrEqualTo0 = (n, description) => {
    if (n < 0) {
        throw new Error(`${description} (${n}) cannot be less than 0`);
    }
    return n;
}

/**
 * Check if value is defined and not less then 0, if not then throw error message
 * @param {number} n - the value to check
 * @param {string} description - description of the value being checked
 * @returns {number}
 */
export const mustBeGreaterThan0 = (n, description) => {
    if (n <= 0) {
        throw new Error(`${description} (${n}) cannot be less than or equal to 0`);
    }
    return n;
}

/**
 * Check that a value is between two values
 * @param {number} minimum - the minimum a value can be
 * @param {number} n - the value to check
 * @param {number} maximum - the maximum a value can be
 * @param {string} description - description of the value being checked
 * @returns {number}
 */
export const mustBeBetween = (minimum, n, maximum, description) => {
    if (maximum < minimum) {
        throw new Error(`${description} cannot set minimum (${minimum}) greater than maximum (${maximum})`);
    }
    if (maximum === minimum) {
        throw new Error(`${description} cannot set minimum (${minimum}) equal to maximum (${maximum})`);
    }
    if (n < minimum || n > maximum) {
        throw new Error(`${description} (${n}) must be between (${minimum}) and (${maximum})`);
    }
    return n;
}