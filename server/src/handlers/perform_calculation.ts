import { db } from '../db';
import { calculationsTable } from '../db/schema';
import { type PerformCalculationInput, type CalculationResult } from '../schema';

export const performCalculation = async (input: PerformCalculationInput): Promise<CalculationResult> => {
  try {
    let result: number;
    
    // Perform the calculation based on operation
    switch (input.operation) {
      case 'add':
        result = input.first_number + input.second_number;
        break;
      case 'subtract':
        result = input.first_number - input.second_number;
        break;
      case 'multiply':
        result = input.first_number * input.second_number;
        break;
      case 'divide':
        // Handle division by zero for kids safety
        if (input.second_number === 0) {
          throw new Error('Cannot divide by zero!');
        }
        result = input.first_number / input.second_number;
        break;
      default:
        throw new Error('Invalid operation');
    }
    
    // Store calculation in database
    const calculationRecord = await db.insert(calculationsTable)
      .values({
        first_number: input.first_number,
        second_number: input.second_number,
        operation: input.operation,
        result: result
      })
      .returning()
      .execute();
    
    const calculation = calculationRecord[0];
    
    return {
      result: result,
      calculation: calculation
    };
  } catch (error) {
    console.error('Calculation failed:', error);
    throw error;
  }
};