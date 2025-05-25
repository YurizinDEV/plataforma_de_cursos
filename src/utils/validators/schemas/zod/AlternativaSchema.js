import { z } from 'zod';

export const AlternativaSchema = z.object({
  texto: z.string().min(1, "Texto é obrigatório"),
  numeroResposta: z.number().int().min(0),
  questionarioId: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID inválido")
});

export const AlternativaUpdateSchema = AlternativaSchema.partial();