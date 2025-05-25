import { z } from 'zod';

export const AulaSchema = z.object({
  titulo: z.string().min(3).max(100),
  descricao: z.string().optional(),
  conteudoURL: z.string().url(),
  cargaHoraria: z.number().int().positive(),
  materialComplementar: z.array(z.string()).optional(),
  cursoId: z.string().regex(/^[0-9a-fA-F]{24}$/), // ObjectId do MongoDB
});

export const AulaUpdateSchema = AulaSchema.partial();