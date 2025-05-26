import { z } from 'zod';

export const QuestionarioQuerySchema = z.object({
  aulaId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional()
});

export const QuestionarioIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);