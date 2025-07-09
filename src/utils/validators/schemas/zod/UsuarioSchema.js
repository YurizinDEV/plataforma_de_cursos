// src/utils/validators/schemas/zod/UsuarioSchema.js
import {
  z
} from 'zod';
import objectIdSchema from './ObjectIdSchema.js';
import {
  RotaSchema
} from './RotaSchema.js';

const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const distinctObjectIdArray = z
  .array(objectIdSchema)
  .refine(
    (arr) => new Set(arr.map((id) => id.toString())).size === arr.length, {
      message: 'Não pode conter IDs repetidos.'
    }
  );


const UsuarioSchema = z.object({
  nome: z.string().min(1, 'Campo nome é obrigatório.'),
  email: z
    .string()
    .email('Formato de email inválido.')
    .min(1, 'Campo email é obrigatório.'),
  senha: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres.')
    .regex(senhaRegex, 'A senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial.'),
  ehAdmin: z.boolean().optional().default(false),
  link_foto: z.string().optional(),
  ativo: z.boolean().default(false),


  progresso: z.array(z.object({
    percentual_conclusao: z.string().min(1, 'Percentual de conclusão é obrigatório.'),
    curso: objectIdSchema
  })).optional().default([]),


  cursosIds: distinctObjectIdArray.optional().default([]),
});

const UsuarioUpdateSchema = UsuarioSchema.partial();

export {
  UsuarioSchema,
  UsuarioUpdateSchema
};