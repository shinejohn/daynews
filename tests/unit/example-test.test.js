/**
 * Example unit test to demonstrate the comprehensive test system
 */

describe('Example Test Suite', () => {
  test('should demonstrate basic test functionality', () => {
    const result = 2 + 2;
    expect(result).toBe(4);
  });

  test('should test string operations', () => {
    const str = 'Hello World';
    expect(str).toContain('World');
    expect(str.length).toBe(11);
    expect(str.toLowerCase()).toBe('hello world');
  });

  test('should test array operations', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr).toHaveLength(5);
    expect(arr).toContain(3);
    expect(arr.slice(0, 3)).toEqual([1, 2, 3]);
  });

  test('should test object properties', () => {
    const obj = {
      name: 'Day News',
      type: 'news-app',
      features: ['articles', 'events', 'classifieds']
    };
    
    expect(obj).toHaveProperty('name');
    expect(obj.name).toBe('Day News');
    expect(obj.features).toContain('articles');
    expect(Object.keys(obj)).toHaveLength(3);
  });

  test('should test async functionality', async () => {
    const asyncOperation = () => {
      return new Promise(resolve => {
        setTimeout(() => resolve('completed'), 100);
      });
    };

    const result = await asyncOperation();
    expect(result).toBe('completed');
  });

  test('should test error handling', () => {
    const throwError = () => {
      throw new Error('Test error');
    };

    expect(throwError).toThrow('Test error');
    expect(throwError).toThrow(Error);
  });
});