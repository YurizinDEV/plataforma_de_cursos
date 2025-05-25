import { z } from 'zod';

export const AulaQuerySchema = z.object({
  titulo: z.string().optional(),
  cursoId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

export const AulaIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);