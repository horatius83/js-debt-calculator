import { mustBeBetween, mustBeGreaterThan0, mustBeGreaterThanOrEqualTo0 } from "../../app/modules/validation.mjs"

describe('validation', () => {
    describe('mustBeGreaterThanOrEqualTo0', () => {
        it('should throw error if value is less than 0', () => {
            expect(() => mustBeGreaterThanOrEqualTo0(-1, 'Test'))
            .toThrow(new Error('Test (-1) cannot be less than 0'))
        }),
        it('should return value if 0', () => {
            expect(mustBeGreaterThanOrEqualTo0(0, 'Test')).toBe(0);
        }),
        it('should return value if greater than 0', () => {
            expect(mustBeGreaterThanOrEqualTo0(1, 'Test')).toBe(1);
        })
    }),
    describe('mustBeGreaterThan0', () => {
        it('should throw error if value is less than 0', () => {
            expect(() => mustBeGreaterThan0(-1, 'Test'))
            .toThrow(new Error('Test (-1) cannot be less than or equal to 0'));
        }),
        it('should throw error if value is 0', () => {
            expect(() => mustBeGreaterThan0(0, 'Test'))
            .toThrow(new Error('Test (0) cannot be less than or equal to 0'));
        }),
        it('should return value if greater than 0', () => {
            expect(mustBeGreaterThanOrEqualTo0(1, 'Test')).toBe(1);
        })
    }),
    describe('mustBeBetween', () => {
        it('should not allow you to set the maximum less than the minimum', () => {
           expect(() => mustBeBetween(1, 0.5, 0, 'Test'))
           .toThrow(new Error(`Test cannot set minimum (1) greater than maximum (0)`));
        }),
        it('should now allow you to set the maximum equal to the minimum', () => {
            expect(() => mustBeBetween(1, 0.5, 1, 'Test'))
            .toThrow(new Error(`Test cannot set minimum (1) equal to maximum (1)`))
        }),
        it('should throw error if value is less than minimum', () => {
            expect(() => mustBeBetween(0, -1, 1, 'Test'))
            .toThrow(new Error(`Test (-1) must be between (0) and (1)`));
        }),
        it('should throw error if value is greater than maximum', () => {
            expect(() => mustBeBetween(0, 2, 1, 'Test'))
            .toThrow(new Error(`Test (2) must be between (0) and (1)`));
        }),
        it('should return value if between minimum and maximum', () => {
            expect(mustBeBetween(0, 0.5, 1, 'Test')).toBe(0.5);
        })
        it('should return value if equal to minimum', () => {
            expect(mustBeBetween(0, 0, 1, 'Test')).toBe(0);
        }),
        it('should return value if equal to maximum', () => {
            expect(mustBeBetween(0, 1, 1, 'Test')).toBe(1);
        })
    })
})