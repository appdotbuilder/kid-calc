import { serial, text, pgTable, timestamp, real, pgEnum } from 'drizzle-orm/pg-core';

// Define enum for calculation operations
export const calculationOperationEnum = pgEnum('calculation_operation', ['add', 'subtract', 'multiply', 'divide']);

// Calculations table to store calculation history
export const calculationsTable = pgTable('calculations', {
  id: serial('id').primaryKey(),
  first_number: real('first_number').notNull(),
  second_number: real('second_number').notNull(),
  operation: calculationOperationEnum('operation').notNull(),
  result: real('result').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type Calculation = typeof calculationsTable.$inferSelect; // For SELECT operations
export type NewCalculation = typeof calculationsTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { calculations: calculationsTable };