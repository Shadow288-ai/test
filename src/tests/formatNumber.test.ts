import { formatNumber, formatCurrency } from '../utils/formatNumber';
import { describe, it, expect } from 'vitest';

describe('formatNumber', () => {
  it('formats numbers <1000 with 2 decimals', () => {
    expect(formatNumber(999.22)).toBe('999.22');
  });

  it('formats thousands with K', () => {
    expect(formatNumber(5000)).toBe('5.0K');
  });

  it('formats millions with M', () => {
    expect(formatNumber(2500000)).toBe('2.50M');
  });
});

describe('formatCurrency', () => {
  it('formats with correct symbol', () => {
    expect(formatCurrency(1000, '$')).toBe('$1.0K');
  });
});
