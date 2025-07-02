// src/utils/validators/schemas/zod/CursoQuerySchema.js

import { z } from 'zod';
import objectIdSchema from '../ObjectIdSchema.js';

const CursoIdSchema = objectIdSchema.describe('id do curso');

const CursoQuerySchema = z.object({
    titulo: z.string().optional(),
    tituloExato: z.string().optional(),
    descricao: z.string().optional(),
    buscaGeral: z.string().optional(),
    cargaHorariaMin: z.coerce.number().min(0, 'Carga horária mínima não pode ser negativa').optional(),
    cargaHorariaMax: z.coerce.number().min(0, 'Carga horária máxima não pode ser negativa').optional(),
    cargaHorariaFaixa: z.enum(['curta', 'media', 'longa']).optional(),
    
    // Filtros OR (comportamento padrão)
    tags: z.string().optional(),
    professores: z.string().optional(),
    
    // Filtros AND - NOVA IMPLEMENTAÇÃO PARA API
    todasTags: z.string().optional(),
    todosProfessores: z.string().optional(),
    
    // Filtros AND alternativos - usando múltiplos parâmetros
    tag1: z.string().optional(),
    tag2: z.string().optional(), 
    tag3: z.string().optional(),
    professor1: z.string().optional(),
    professor2: z.string().optional(),
    professor3: z.string().optional(),
    
    // Filtros AND via array (suporte a ?tags[]=js&tags[]=db)
    'tags[]': z.union([z.string(), z.array(z.string())]).optional(),
    'professores[]': z.union([z.string(), z.array(z.string())]).optional(),
    
    criadoPorId: objectIdSchema.optional(),
    criadoApos: z.string().datetime().optional(),
    criadoAntes: z.string().datetime().optional(),
    atualizadoApos: z.string().datetime().optional(),
    temMaterialComplementar: z.union([
        z.boolean(),
        z.enum(['true', 'false', '1', '0']).transform(value => value === 'true' || value === '1')
    ]).optional(),
    temThumbnail: z.union([
        z.boolean(),
        z.enum(['true', 'false', '1', '0']).transform(value => value === 'true' || value === '1')
    ]).optional(),
    status: z.enum(['ativo', 'inativo', 'rascunho', 'arquivado']).optional(),
    quantidadeAulasMin: z.coerce.number().min(0, 'Quantidade mínima de aulas não pode ser negativa').optional(),
    quantidadeAulasMax: z.coerce.number().min(0, 'Quantidade máxima de aulas não pode ser negativa').optional(),
    ordenarPor: z.enum(['titulo', 'createdAt', 'updatedAt', 'cargaHorariaTotal', 'status']).optional(),
    direcaoOrdem: z.enum(['asc', 'desc']).optional(),
    page: z.coerce.number().positive().optional(),
    limit: z.coerce.number().positive().optional()
});

export { CursoIdSchema, CursoQuerySchema };
