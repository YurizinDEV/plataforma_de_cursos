import { z } from 'zod';

export const AlternativaQuerySchema = z.object({
  questionarioId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional()
});

export const AlternativaIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);