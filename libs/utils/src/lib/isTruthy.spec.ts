import { isTruthy } from './isTruthy';

describe('isTruthy', () => {
  it('should return true for truthy values', () => {
    expect(isTruthy(true)).toBe(true);
    expect(isTruthy({})).toBe(true);
    expect(isTruthy([])).toBe(true);
    expect(isTruthy(1)).toBe(true);
    expect(isTruthy(10)).toBe(true);
  });

  it('should return false for falsy values', () => {
    expect(isTruthy(false)).toBe(false);
    expect(isTruthy(undefined)).toBe(false);
    expect(isTruthy(null)).toBe(false);
    expect(isTruthy(0)).toBe(false);
    expect(isTruthy(NaN)).toBe(false);
  });
});
