// src/utils/validators/schemas/zod/CursoSchema.js

import {
    z
} from 'zod';
import objectIdSchema from './ObjectIdSchema.js';

const CursoSchema = z.object({
    titulo: z.string().min(1, 'Título é obrigatório.').max(100, 'Título deve ter no máximo 100 caracteres.'),
    descricao: z.string().optional(),
    thumbnail: z.string().url('Thumbnail deve ser uma URL válida.').max(250, 'Thumbnail deve ter no máximo 250 caracteres.').optional(),
    cargaHorariaTotal: z.number().min(0, 'Carga horária total não pode ser negativa.').optional().default(0),
    materialComplementar: z.array(z.string().url('Cada material deve ser uma URL válida.')).optional(),
    professores: z.array(z.string().min(1, 'Nome do professor é obrigatório.')).optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['ativo', 'inativo', 'rascunho', 'arquivado']).optional().default('ativo'),
    criadoPorId: objectIdSchema
});

const CursoUpdateSchema = CursoSchema.partial();

export {
    CursoSchema,
    CursoUpdateSchema
};