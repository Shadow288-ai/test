import { describe, it, expect } from 'vitest';
import { validateCSVStructure } from '../utils/csvValidation';

describe('validateCSVStructure', () => {
  it('should fail for empty data', () => {
    const result = validateCSVStructure([]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('CSV file is empty');
  });

  it('should check for required columns', () => {
    const data = [{ Foo: 1, Bar: 2 }];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = validateCSVStructure(data as any);
    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toMatch(/Missing required columns/);
  });

  it('should pass for valid input', () => {
    const data = [{
      Ticker: 'AAPL',
      Purchase_Price: '150.50',
      Quantity: '10'
    }];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = validateCSVStructure(data as any);
    expect(res.isValid).toBe(true);
    expect(res.errors.length).toBe(0);
  });
});
