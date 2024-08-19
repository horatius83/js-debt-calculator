import Dinero from 'dinero.js';
import { moneyFormat, zero } from './util.mjs';
import { EmergencyFundPayment } from './emergencyFundPayment.mjs';

export class EmergencyFund {
    /**
     * A payment plan for an emergency fund, once the target amount is reached, all further bonus money will be 
     * applied to the loans
     * @param { Dinero.Dinero } targetAmount - the target amount for the Emergency fund
     * @param {number} percentageOfBonusFunds - the percentage of bonus funds to apply to the emergency fund, must be between 0 (0%) and 1 (100%)
     */
    constructor(targetAmount, percentageOfBonusFunds) {
        if (targetAmount.lessThanOrEqual(zero)) {
            throw new Error(`Target amount (${targetAmount.toFormat(moneyFormat)}) must be greater than $0`)
        }
        const toPercent = (decimalValue) => `${decimalValue * 100.0}%`;
        this.targetAmount = targetAmount;
        if (percentageOfBonusFunds < 0) {
            throw new Error(`Percentage of bonus funds (${toPercent(percentageOfBonusFunds)}) cannot be less than 0%`);
        }
        if (percentageOfBonusFunds > 1) {
            throw new Error(`Percentage of bonus funds (${toPercent(percentageOfBonusFunds)}) cannot be more than 100%`);
        }
        this.percentageOfBonusFunds = percentageOfBonusFunds;
        /** @type {EmergencyFundPayment[]} */
        this.payments = [];
        this.isPaidOff = false;
    }

    /**
     * Add payment to emergency fund and return any remaining money if partial or no payment is needed
     * @param { Dinero.Dinero } amount - the amount to pay to the Emergency Fund
     * @returns { Dinero.Dinero } - amount leftover if this is paid off
     */
    addPayment(amount) {
        if (amount.lessThanOrEqual(zero)) {
            throw new Error(`Amount (${amount.toFormat(moneyFormat)}) must be greater than $0`);
        }
        if (this.isPaidOff) {
            return amount;
        }
        const mostRecentPayment = this.payments.at(-1);
        if (mostRecentPayment) {
            if (mostRecentPayment.amountRemaining > amount) {
                this.payments.push(
                    new EmergencyFundPayment(amount, mostRecentPayment.amountRemaining.subtract(amount))
                );
                return zero;
            } else {
                this.payments.push(new EmergencyFundPayment(mostRecentPayment.amountRemaining, zero));
                this.isPaidOff = true;
                return amount.subtract(mostRecentPayment.amountRemaining);
            }
        } else {
            console.log('No recent payment');
            if (this.targetAmount > amount) {
                console.log('this.targetAmount > amount');
                this.payments.push(new EmergencyFundPayment(amount, this.targetAmount.subtract(amount)));
                return zero;
            } else {
                console.log('!this.targetAmount > amount')
                this.payments.push(new EmergencyFundPayment(this.targetAmount, zero));
                this.isPaidOff = true;
                return amount.subtract(this.targetAmount);
            }
        }
    }
}