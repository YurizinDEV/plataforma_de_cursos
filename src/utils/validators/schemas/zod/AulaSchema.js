import { z } from 'zod';
import mongoose from 'mongoose';

export const AulaSchema = z.object({
  titulo: z.string().min(3, { message: "mínimo de 3 caracteres" }).max(100),
  descricao: z.string().optional(),
  conteudoURL: z.string()
  .url({ message: "URL inválida" })
  .refine(url => url.startsWith('http://') || url.startsWith('https://'), {
  message: "URL deve começar com http:// ou https://"
  }),
  cargaHoraria: z.number().int().positive().gt(0, { message: "número inteiro positivo" }),
  materialComplementar: z.array(z.string()).default([]),
  cursoId: z.string()
  .refine(val => mongoose.Types.ObjectId.isValid(val), {
  message: "ID inválido"
  }),
  criadoPorId: z.string()
  .refine(val => mongoose.Types.ObjectId.isValid(val), {
  message: "ID inválido"
  })
});

export const AulaUpdateSchema = AulaSchema.partial();