// src/utils/validators/schemas/zod/CursoQuerySchema.js

import { z } from 'zod';
import objectIdSchema from '../ObjectIdSchema.js';

const CursoIdSchema = objectIdSchema.describe('id do curso');

const CursoQuerySchema = z.object({
    titulo: z.string().optional(),    cargaHorariaMin: z.coerce.number().min(0, 'Carga horária mínima não pode ser negativa').optional(),
    cargaHorariaMax: z.coerce.number().min(0, 'Carga horária máxima não pode ser negativa').optional(),
    tags: z.union([
        z.string().transform(val => val.split(',')),
        z.array(z.string())
    ]).optional(),
    professores: z.union([
        z.string().transform(val => val.split(',')),
        z.array(z.string())
    ]).optional(),
    criadoPorId: objectIdSchema.optional(),
    page: z.coerce.number().positive().optional(),
    limit: z.coerce.number().positive().optional()
});

export { CursoIdSchema, CursoQuerySchema };
