import { z } from 'zod';

export const CreateUrlSchema = z.object({
  longUrl: z
    .url({ error: 'Must be a valid URL including protocol (http:// or https://)' })
    .max(2048, 'URL must be at most 2048 characters'),
});

export const ShortCodeParamSchema = z.object({
  shortCode: z
    .string()
    .min(1, 'shortCode is required')
    .max(20, 'shortCode too long')
    .regex(/^[a-zA-Z0-9]+$/, 'shortCode must be alphanumeric'),
});

export type CreateUrlInput = z.infer<typeof CreateUrlSchema>;
export type ShortCodeParam = z.infer<typeof ShortCodeParamSchema>;
