import { z } from 'zod';

export const AulaQuerySchema = z.object({
  titulo: z.string().optional(),
  cursoId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional()
}).passthrough();

export const AulaIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "ID da aula inválido");