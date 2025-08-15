import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { calculationsTable } from '../db/schema';
import { clearCalculationHistory } from '../handlers/clear_calculation_history';

describe('clearCalculationHistory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return success response', async () => {
    const result = await clearCalculationHistory();

    expect(result.success).toBe(true);
    expect(result.message).toBe('Calculation history cleared successfully!');
  });

  it('should clear all calculations from database', async () => {
    // Insert test calculations first
    await db.insert(calculationsTable).values([
      {
        first_number: 5,
        second_number: 3,
        operation: 'add',
        result: 8
      },
      {
        first_number: 10,
        second_number: 2,
        operation: 'divide',
        result: 5
      },
      {
        first_number: 7,
        second_number: 4,
        operation: 'multiply',
        result: 28
      }
    ]).execute();

    // Verify calculations exist before clearing
    let calculations = await db.select().from(calculationsTable).execute();
    expect(calculations).toHaveLength(3);

    // Clear calculation history
    await clearCalculationHistory();

    // Verify all calculations are removed
    calculations = await db.select().from(calculationsTable).execute();
    expect(calculations).toHaveLength(0);
  });

  it('should work with empty database', async () => {
    // Verify database is empty initially
    const calculationsBefore = await db.select().from(calculationsTable).execute();
    expect(calculationsBefore).toHaveLength(0);

    // Clear empty database should still work
    const result = await clearCalculationHistory();

    expect(result.success).toBe(true);
    expect(result.message).toBe('Calculation history cleared successfully!');

    // Verify database is still empty
    const calculationsAfter = await db.select().from(calculationsTable).execute();
    expect(calculationsAfter).toHaveLength(0);
  });

  it('should handle multiple clear operations', async () => {
    // Insert test calculation
    await db.insert(calculationsTable).values({
      first_number: 12,
      second_number: 6,
      operation: 'subtract',
      result: 6
    }).execute();

    // First clear
    let result = await clearCalculationHistory();
    expect(result.success).toBe(true);

    let calculations = await db.select().from(calculationsTable).execute();
    expect(calculations).toHaveLength(0);

    // Second clear on empty database
    result = await clearCalculationHistory();
    expect(result.success).toBe(true);

    calculations = await db.select().from(calculationsTable).execute();
    expect(calculations).toHaveLength(0);
  });
});