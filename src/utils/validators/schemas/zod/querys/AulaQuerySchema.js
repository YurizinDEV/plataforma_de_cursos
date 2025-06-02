import { z } from 'zod';
import mongoose from 'mongoose';

export const AulaQuerySchema = z.object({
  titulo: z.string().trim().optional(),
  cursoId: z.string()
    .refine(val => mongoose.Types.ObjectId.isValid(val), {
      message: "ID inválido"
    })
    .optional(),
  page: z.coerce.number({
    invalid_type_error: "Número inválido"
  })
  .int()
  .min(1, { message: "mínimo 1" })
  .default(1),
  limit: z.coerce.number({
    invalid_type_error: "Número inválido"
  })
  .int()
  .min(1, { message: "mínimo 1" })
  .max(100, { message: "máximo 100" })
  .default(10)
}).strict();

export const AulaIdSchema = z.string()
  .refine(val => mongoose.Types.ObjectId.isValid(val), {
    message: "ID da aula inválido"
  });