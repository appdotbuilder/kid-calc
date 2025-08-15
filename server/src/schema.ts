import { z } from 'zod';

// Calculation operation enum
export const calculationOperationSchema = z.enum(['add', 'subtract', 'multiply', 'divide']);
export type CalculationOperation = z.infer<typeof calculationOperationSchema>;

// Calculation schema
export const calculationSchema = z.object({
  id: z.number(),
  first_number: z.number(),
  second_number: z.number(),
  operation: calculationOperationSchema,
  result: z.number(),
  created_at: z.coerce.date()
});

export type Calculation = z.infer<typeof calculationSchema>;

// Input schema for performing calculations
export const performCalculationInputSchema = z.object({
  first_number: z.number(),
  second_number: z.number(),
  operation: calculationOperationSchema
});

export type PerformCalculationInput = z.infer<typeof performCalculationInputSchema>;

// Response schema for calculation result
export const calculationResultSchema = z.object({
  result: z.number(),
  calculation: calculationSchema
});

export type CalculationResult = z.infer<typeof calculationResultSchema>;