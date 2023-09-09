import {round} from '../../app/modules/mathutil.mjs'

describe('mathutil', () => {
    describe('round', () => {
        it('should return integer number if places is 0', () => {
            expect(round(10.1, 0)).toBe(10);
        }),
        it('should return number to 1 places if places is 1', () => {
            expect(round(10.1, 1)).toBe(10.1);
        }),
        it('should return number to 1 places if places is 2 but original number only goes to 1', () => {
            expect(round(10.1, 2)).toBe(10.1);
        }),
        it('should return number to 2 places if places is 2', () => {
            expect(round(10.12, 2)).toBe(10.12);
        })
    })
});