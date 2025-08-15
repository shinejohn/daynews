// Simple test to verify Jest works with ES modules
import { describe, it, expect } from '@jest/globals';

describe('Simple Test', () => {
  it('should pass basic assertion', () => {
    expect(2 + 2).toBe(4);
  });

  it('should work with async', async () => {
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  });
});