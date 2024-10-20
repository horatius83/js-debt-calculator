import { EmergencyFund } from "../../app/modules/emergencyFund.mjs";
import { usd, zero } from "../../app/modules/util.mjs";

describe('Emergency Fund', () => {
    describe('constructor', () => {
        it('should create successfully', () => {
            const targetAmount = usd(100);
            const percentageOfBonusFunds = 0.5;

            const ef = new EmergencyFund(targetAmount, percentageOfBonusFunds);

            expect(ef).toBeDefined();
            expect(ef.isPaidOff).toBe(false);
            expect(ef.payments.length).toBe(0);
            expect(ef.percentageOfBonusFunds).toBeCloseTo(percentageOfBonusFunds);
            expect(ef.targetAmount.getAmount()).toBe(targetAmount.getAmount());
        });
        it('should throw an error if the target amount is invalid', () => {
            const targetAmount = undefined;
            const percentageOfBonusFunds = 0.5;

            const efp = () => new EmergencyFund(targetAmount, percentageOfBonusFunds);

            expect(efp).toThrow(new Error('Target amount must be defined'));
        });
        it('should throw an error if the target amount is less than or equal to zero', () => {
            const targetAmount = zero;
            const percentageOfBonusFunds = 0.5;

            const efp = () => new EmergencyFund(targetAmount, percentageOfBonusFunds);

            expect(efp).toThrow(new Error('Target amount ($0.00) must be greater than $0'));
        });
        it('should not allow percentages less than 0', () => {
            const targetAmount = usd(100);
            const percentageOfBonusFunds = -1;

            const efp = () => new EmergencyFund(targetAmount, percentageOfBonusFunds);

            expect(efp).toThrow(new Error('Percentage of bonus funds (-100%) cannot be less than 0%'));
        });
        it('should not allow percentages greater than 1', () => {
            const targetAmount = usd(100);
            const percentageOfBonusFunds = 2;

            const efp = () => new EmergencyFund(targetAmount, percentageOfBonusFunds);

            expect(efp).toThrow(new Error('Percentage of bonus funds (200%) cannot be more than 100%'));
        });
    });
    describe('addPayment', () => {
        it('should add first payment', () => {
            const targetAmount = usd(100);
            const percentageOfBonusFunds = 0.5;
            const payment = usd(10);
            const ef = new EmergencyFund(targetAmount, percentageOfBonusFunds);

            const result = ef.addPayment(payment);

            const amountRemaining = targetAmount.subtract(payment);
            expect(result.getAmount()).toBe(zero.getAmount());
            expect(ef.isPaidOff).toBeFalse();
            expect(ef.payments.length).toBe(1);
            expect(ef.payments[0].amountRemaining.getAmount()).toBe(amountRemaining.getAmount());
            expect(ef.payments[0].payment.getAmount()).toBe(payment.getAmount());
        });
        it('should add second payment', () => {
            const targetAmount = usd(100);
            const percentageOfBonusFunds = 0.5;
            const payment = usd(10);
            const ef = new EmergencyFund(targetAmount, percentageOfBonusFunds);
            const result = ef.addPayment(payment);

            const secondResult = ef.addPayment(payment);

            const amountRemaining = targetAmount.subtract(payment).subtract(payment);
            expect(result.getAmount()).toBe(zero.getAmount());
            expect(secondResult.getAmount()).toBe(zero.getAmount());
            expect(ef.isPaidOff).toBeFalse();
            expect(ef.payments.length).toBe(2);
            expect(ef.payments[1].amountRemaining.getAmount()).toBe(amountRemaining.getAmount());
            expect(ef.payments[1].payment.getAmount()).toBe(payment.getAmount());
        });
        it('should add final payment', () => {
            const targetAmount = usd(100);
            const percentageOfBonusFunds = 1.0;
            const payment = usd(50);
            const ef = new EmergencyFund(targetAmount, percentageOfBonusFunds);
            const result = ef.addPayment(payment);

            const secondResult = ef.addPayment(payment);

            expect(result.getAmount()).toBe(zero.getAmount());
            expect(secondResult.getAmount()).toBe(zero.getAmount());
            expect(ef.isPaidOff).toBeTrue();
            expect(ef.payments.length).toBe(2);
            expect(ef.payments[1].amountRemaining.getAmount()).toBe(zero.getAmount());
            expect(ef.payments[1].payment.getAmount()).toBe(payment.getAmount());
        });
        it('should allow first-and-final payment', () => {
            const targetAmount = usd(100);
            const percentageOfBonusFunds = 1.0;
            const payment = usd(100);
            const ef = new EmergencyFund(targetAmount, percentageOfBonusFunds);

            const result = ef.addPayment(payment);

            expect(result.getAmount()).toBe(zero.getAmount());
            expect(ef.isPaidOff).toBeTrue();
            expect(ef.payments.length).toBe(1);
            expect(ef.payments[0].amountRemaining.getAmount()).toBe(zero.getAmount());
            expect(ef.payments[0].payment.getAmount()).toBe(payment.getAmount());
        });
        it('should output any leftover amount', () => {
            const targetAmount = usd(100);
            const percentageOfBonusFunds = 1.0;
            const payment = usd(200);
            const ef = new EmergencyFund(targetAmount, percentageOfBonusFunds);

            const result = ef.addPayment(payment);

            expect(result.getAmount()).toBe(payment.subtract(targetAmount).getAmount());
            expect(ef.isPaidOff).toBeTrue();
            expect(ef.payments.length).toBe(1);
            expect(ef.payments[0].amountRemaining.getAmount()).toBe(zero.getAmount());
            expect(ef.payments[0].payment.getAmount()).toBe(targetAmount.getAmount());
        });
        it('should not allow payments equal to or less than $0', () => {
            const targetAmount = usd(100);
            const percentageOfBonusFunds = 1.0;
            const payment = zero;
            const ef = new EmergencyFund(targetAmount, percentageOfBonusFunds);

            const resultP = () => ef.addPayment(payment);

            expect(resultP).toThrow(new Error('Amount ($0.00) must be greater than $0'));
        });
    });
});