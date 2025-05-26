import { z } from 'zod';

export const CertificadoQuerySchema = z.object({
  usuarioId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  cursoId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional()
});

export const CertificadoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);