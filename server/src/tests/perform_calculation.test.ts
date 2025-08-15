import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { calculationsTable } from '../db/schema';
import { type PerformCalculationInput } from '../schema';
import { performCalculation } from '../handlers/perform_calculation';
import { eq } from 'drizzle-orm';

describe('performCalculation', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should perform addition correctly', async () => {
    const input: PerformCalculationInput = {
      first_number: 10,
      second_number: 5,
      operation: 'add'
    };

    const result = await performCalculation(input);

    expect(result.result).toEqual(15);
    expect(result.calculation.first_number).toEqual(10);
    expect(result.calculation.second_number).toEqual(5);
    expect(result.calculation.operation).toEqual('add');
    expect(result.calculation.result).toEqual(15);
    expect(result.calculation.id).toBeDefined();
    expect(result.calculation.created_at).toBeInstanceOf(Date);
  });

  it('should perform subtraction correctly', async () => {
    const input: PerformCalculationInput = {
      first_number: 10,
      second_number: 3,
      operation: 'subtract'
    };

    const result = await performCalculation(input);

    expect(result.result).toEqual(7);
    expect(result.calculation.operation).toEqual('subtract');
    expect(result.calculation.result).toEqual(7);
  });

  it('should perform multiplication correctly', async () => {
    const input: PerformCalculationInput = {
      first_number: 6,
      second_number: 4,
      operation: 'multiply'
    };

    const result = await performCalculation(input);

    expect(result.result).toEqual(24);
    expect(result.calculation.operation).toEqual('multiply');
    expect(result.calculation.result).toEqual(24);
  });

  it('should perform division correctly', async () => {
    const input: PerformCalculationInput = {
      first_number: 20,
      second_number: 4,
      operation: 'divide'
    };

    const result = await performCalculation(input);

    expect(result.result).toEqual(5);
    expect(result.calculation.operation).toEqual('divide');
    expect(result.calculation.result).toEqual(5);
  });

  it('should handle decimal results in division', async () => {
    const input: PerformCalculationInput = {
      first_number: 10,
      second_number: 3,
      operation: 'divide'
    };

    const result = await performCalculation(input);

    expect(result.result).toBeCloseTo(3.3333, 4);
    expect(result.calculation.result).toBeCloseTo(3.3333, 4);
  });

  it('should throw error for division by zero', async () => {
    const input: PerformCalculationInput = {
      first_number: 10,
      second_number: 0,
      operation: 'divide'
    };

    await expect(performCalculation(input)).rejects.toThrow(/cannot divide by zero/i);
  });

  it('should save calculation to database', async () => {
    const input: PerformCalculationInput = {
      first_number: 8,
      second_number: 2,
      operation: 'multiply'
    };

    const result = await performCalculation(input);

    // Query database to verify record was saved
    const calculations = await db.select()
      .from(calculationsTable)
      .where(eq(calculationsTable.id, result.calculation.id))
      .execute();

    expect(calculations).toHaveLength(1);
    expect(calculations[0].first_number).toEqual(8);
    expect(calculations[0].second_number).toEqual(2);
    expect(calculations[0].operation).toEqual('multiply');
    expect(calculations[0].result).toEqual(16);
    expect(calculations[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle negative numbers', async () => {
    const input: PerformCalculationInput = {
      first_number: -5,
      second_number: 3,
      operation: 'add'
    };

    const result = await performCalculation(input);

    expect(result.result).toEqual(-2);
    expect(result.calculation.first_number).toEqual(-5);
    expect(result.calculation.result).toEqual(-2);
  });

  it('should handle floating point numbers', async () => {
    const input: PerformCalculationInput = {
      first_number: 2.5,
      second_number: 1.5,
      operation: 'multiply'
    };

    const result = await performCalculation(input);

    expect(result.result).toEqual(3.75);
    expect(result.calculation.first_number).toEqual(2.5);
    expect(result.calculation.second_number).toEqual(1.5);
    expect(result.calculation.result).toEqual(3.75);
  });

  it('should create multiple calculation records', async () => {
    const inputs = [
      { first_number: 1, second_number: 2, operation: 'add' as const },
      { first_number: 10, second_number: 5, operation: 'subtract' as const },
      { first_number: 3, second_number: 4, operation: 'multiply' as const }
    ];

    const results = await Promise.all(inputs.map(input => performCalculation(input)));

    expect(results).toHaveLength(3);
    expect(results[0].result).toEqual(3);
    expect(results[1].result).toEqual(5);
    expect(results[2].result).toEqual(12);

    // Verify all records are saved in database
    const allCalculations = await db.select()
      .from(calculationsTable)
      .execute();

    expect(allCalculations).toHaveLength(3);
  });
});