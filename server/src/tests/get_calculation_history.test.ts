import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { calculationsTable } from '../db/schema';
import { getCalculationHistory } from '../handlers/get_calculation_history';
import { type CalculationOperation } from '../schema';

// Sample calculation data for testing
const testCalculations = [
  {
    first_number: 10,
    second_number: 5,
    operation: 'add' as CalculationOperation,
    result: 15
  },
  {
    first_number: 20,
    second_number: 4,
    operation: 'divide' as CalculationOperation,
    result: 5
  },
  {
    first_number: 7,
    second_number: 3,
    operation: 'multiply' as CalculationOperation,
    result: 21
  },
  {
    first_number: 100,
    second_number: 25,
    operation: 'subtract' as CalculationOperation,
    result: 75
  }
];

describe('getCalculationHistory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no calculations exist', async () => {
    const result = await getCalculationHistory();

    expect(result).toEqual([]);
    expect(result.length).toEqual(0);
  });

  it('should return all calculations from database', async () => {
    // Insert test calculations - real columns expect numbers directly
    await db.insert(calculationsTable)
      .values(testCalculations)
      .execute();

    const result = await getCalculationHistory();

    expect(result).toHaveLength(4);
    
    // Verify each calculation has the correct structure and types
    result.forEach(calculation => {
      expect(calculation.id).toBeDefined();
      expect(typeof calculation.first_number).toBe('number');
      expect(typeof calculation.second_number).toBe('number');
      expect(typeof calculation.result).toBe('number');
      expect(calculation.operation).toMatch(/^(add|subtract|multiply|divide)$/);
      expect(calculation.created_at).toBeInstanceOf(Date);
    });
  });

  it('should return calculations ordered by most recent first', async () => {
    // Insert calculations with small delays to ensure different timestamps
    for (let i = 0; i < testCalculations.length; i++) {
      const calc = testCalculations[i];
      await db.insert(calculationsTable)
        .values(calc)
        .execute();
      
      // Small delay to ensure different timestamps
      if (i < testCalculations.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    const result = await getCalculationHistory();

    expect(result).toHaveLength(4);
    
    // Verify ordering - most recent should be first
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].created_at >= result[i + 1].created_at).toBe(true);
    }

    // The last inserted calculation should be first in results
    const lastCalculation = testCalculations[testCalculations.length - 1];
    expect(result[0].first_number).toEqual(lastCalculation.first_number);
    expect(result[0].second_number).toEqual(lastCalculation.second_number);
    expect(result[0].operation).toEqual(lastCalculation.operation);
    expect(result[0].result).toEqual(lastCalculation.result);
  });

  it('should correctly handle decimal numbers', async () => {
    // Insert a calculation with decimal numbers
    const testCalc = {
      first_number: 15.75,
      second_number: 2.5,
      operation: 'multiply' as CalculationOperation,
      result: 39.375
    };

    await db.insert(calculationsTable)
      .values(testCalc)
      .execute();

    const result = await getCalculationHistory();

    expect(result).toHaveLength(1);
    expect(result[0].first_number).toEqual(15.75);
    expect(result[0].second_number).toEqual(2.5);
    expect(result[0].result).toEqual(39.375);
    expect(typeof result[0].first_number).toBe('number');
    expect(typeof result[0].second_number).toBe('number');
    expect(typeof result[0].result).toBe('number');
  });

  it('should handle all calculation operations correctly', async () => {
    const operations: CalculationOperation[] = ['add', 'subtract', 'multiply', 'divide'];
    
    // Insert one calculation for each operation
    for (const operation of operations) {
      await db.insert(calculationsTable)
        .values({
          first_number: 10,
          second_number: 2,
          operation,
          result: operation === 'add' ? 12 : 
                 operation === 'subtract' ? 8 :
                 operation === 'multiply' ? 20 : 5
        })
        .execute();
    }

    const result = await getCalculationHistory();

    expect(result).toHaveLength(4);
    
    // Verify all operations are present
    const resultOperations = result.map(calc => calc.operation).sort();
    expect(resultOperations).toEqual(['add', 'divide', 'multiply', 'subtract']);
  });

  it('should preserve calculation timestamps correctly', async () => {
    // Insert a calculation
    await db.insert(calculationsTable)
      .values({
        first_number: 5,
        second_number: 3,
        operation: 'add',
        result: 8
      })
      .execute();

    const result = await getCalculationHistory();
    
    expect(result).toHaveLength(1);
    expect(result[0].created_at).toBeInstanceOf(Date);
    
    // Should be recent (within last few seconds)
    const now = new Date();
    const timeDiff = now.getTime() - result[0].created_at.getTime();
    expect(timeDiff).toBeLessThan(5000); // Less than 5 seconds
  });
});