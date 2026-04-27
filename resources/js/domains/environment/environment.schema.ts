import { z } from 'zod';

export const envVarKeySchema = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[A-Z_][A-Z0-9_]*$/i, 'Must be uppercase with underscores');

export const envVarValueSchema = z.string().min(0).max(10000);

export const envVarInputSchema = z.object({
  key: envVarKeySchema,
  value: envVarValueSchema,
});

export const envVarUpdateSchema = z.object({
  value: envVarValueSchema,
});
