import Dinero from 'dinero.js'

/**
 * Check if value is defined and not less then 0, if not then throw error message
 * @param {Dinero.Dinero} n - the value to check
 * @param {string} description - description of the value being checked
 * @returns {Dinero.Dinero}
 */
export const mustBeGreaterThanOrEqualTo0 = (n, description) => {
    if (n.lessThan(Dinero({amount: 0}))) {
        throw new Error(`${description} (${n}) cannot be less than 0`);
    }
    return n;
}

/**
 * Check if value is defined and not less then 0, if not then throw error message
 * @param {Dinero.Dinero} n - the value to check
 * @param {string} description - description of the value being checked
 * @returns {Dinero.Dinero}
 */
export const mustBeGreaterThan0 = (n, description) => {
    if (n.lessThanOrEqual(Dinero({amount: 0}))) {
        throw new Error(`${description} (${n}) cannot be less than or equal to 0`);
    }
    return n;
}

/**
 * Check that a value is between two values
 * @param {Dinero.Dinero} minimum - the minimum a value can be
 * @param {Dinero.Dinero} n - the value to check
 * @param {Dinero.Dinero} maximum - the maximum a value can be
 * @param {string} description - description of the value being checked
 * @returns {Dinero.Dinero}
 */
export const mustBeBetween = (minimum, n, maximum, description) => {
    if (maximum.lessThan(minimum)) {
        throw new Error(`${description} cannot set minimum (${minimum}) greater than maximum (${maximum})`);
    }
    if (maximum.equalsTo(minimum)) {
        throw new Error(`${description} cannot set minimum (${minimum}) equal to maximum (${maximum})`);
    }
    if (n.lessThan(minimum) || n.greaterThan(maximum)) {
        throw new Error(`${description} (${n}) must be between (${minimum}) and (${maximum})`);
    }
    return n;
}