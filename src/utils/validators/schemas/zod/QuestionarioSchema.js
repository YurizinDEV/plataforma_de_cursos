import { z } from 'zod';

export const QuestionarioSchema = z.object({
  enunciado: z.string().min(10, "Enunciado deve ter pelo menos 10 caracteres"),
  numeroRespostaCorreta: z.number().int().min(0).max(3),
  aulaId: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de aula inválido")
});

export const QuestionarioUpdateSchema = QuestionarioSchema.partial();