import { db } from '../db';
import { calculationsTable } from '../db/schema';
import { type Calculation } from '../schema';
import { desc } from 'drizzle-orm';

export const getCalculationHistory = async (): Promise<Calculation[]> => {
  try {
    // Query all calculations ordered by most recent first
    const results = await db.select()
      .from(calculationsTable)
      .orderBy(desc(calculationsTable.created_at))
      .execute();

    // Real columns are already numbers, no conversion needed
    return results;
  } catch (error) {
    console.error('Failed to fetch calculation history:', error);
    throw error;
  }
};