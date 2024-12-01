import { parseValue, getLoan, usd, textToBase64, base64ToText } from '../../app/modules/util.mjs'

describe('util', () => {
    describe('getLoan', () => {
        it('should return a loan if the values are valid', () => {
            const principal = "1000";
            const interest = "10";
            const minimum = "10";
            const name = 'Test Name';

            const result = getLoan(name, principal, interest, minimum);

            expect(result).not.toBeUndefined();
            expect(result?.name).toBe(name);
            expect(result?.principal.getAmount()).toBe(100000);
            expect(result?.interest).toBe(0.1);
            expect(result?.minimum.getAmount()).toBe(1000);
        });
        it('should return undefined if principal is not a number', () => {
            const principal = "blah";
            const interest = "10";
            const minimum = "10";
            const name = 'Test Name';

            const result = getLoan(name, principal, interest, minimum);

            expect(result).toBeUndefined();
        });
        it('should return undefined if interest is not a number', () => {
            const principal = "1000";
            const interest = "blah";
            const minimum = "10";
            const name = 'Test Name';

            const result = getLoan(name, principal, interest, minimum);

            expect(result).toBeUndefined();
        });
        it('should return undefined if minimum is not a number', () => {
            const principal = "1000";
            const interest = "10";
            const minimum = "blah";
            const name = 'Test Name';

            const result = getLoan(name, principal, interest, minimum);

            expect(result).toBeUndefined();
        });
        it('should return undefined if name is invalid', () => {
            const principal = "1000";
            const interest = "10";
            const minimum = "10";
            const name = undefined;

            const result = getLoan(name, principal, interest, minimum);

            expect(result).toBeUndefined();
        });
    });
    describe('parseValue', () => {
        it('should parse $1', () => {
            const value = "$1";

            const result = parseValue(value);

            expect(result).toBe(1);
        });
        it('should parse $1.0', () => {
            const value = "$1.0";

            const result = parseValue(value);

            expect(result).toBe(1);
        });
        it('should parse $1,000.0', () => {
            const value = "$1,000.0";

            const result = parseValue(value);

            expect(result).toBe(1000);
        });
        it('should parse $1,000.00', () => {
            const value = "$1,000.00";

            const result = parseValue(value);

            expect(result).toBe(1000);
        });
        it('should parse $0.01', () => {
            const value = "$0.01";

            const result = parseValue(value);

            expect(result).toBe(0.01);
        });
        it('should not parse nonsense', () => {
            const value = "blah blah blah";

            const result = parseValue(value);

            expect(result).toBeNaN();
        })
    });
    describe('base64 encoding / decoding', () => {
        it('should encode utf-8 data correctly', () => {
            const testString = 'こんにちは世界';

            const encodedString = textToBase64(testString);
            const decodedString = base64ToText(encodedString);

            expect(decodedString).toBe(testString);
        });
        it('should handle empty strings', () => {
            const testString = '';

            const encodedString = textToBase64(testString);
            const decodedString = base64ToText(encodedString);

            expect(decodedString).toBe(testString);           
        });
    });
});