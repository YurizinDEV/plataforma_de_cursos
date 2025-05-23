// src/utils/validators/schemas/zod/CursoSchema.js

// import { z } from 'zod';
// import objectIdSchema from './ObjectIdSchema.js';

// const CursoSchema = z.object({
//   nome: z.string().min(1, 'Campo nome é obrigatório.'),
//   codigo: z.string().min(1, 'Campo codigo é obrigatório.'),
//   contra_turnos: z.object({
//     segunda: z.boolean().default(false),
//     terca: z.boolean().default(false),
//     quarta: z.boolean().default(false),
//     quinta: z.boolean().default(false),
//     sexta: z.boolean().default(false),
//     sabado: z.boolean().default(false),
//     domingo: z.boolean().default(false),
//   }).default({
//     segunda: false,
//     terca: false,
//     quarta: false,
//     quinta: false,
//     sexta: false,
//     sabado: false,
//     domingo: false,
//   }),
// });

// const CursoUpdateSchema = CursoSchema.partial();

// export { CursoSchema, CursoUpdateSchema };


import { z } from 'zod';
import objectIdSchema from './ObjectIdSchema.js';

const CursoSchema = z.object({
    titulo: z.string().min(1, 'Título é obrigatório.').max(100, 'Título deve ter no máximo 100 caracteres.'),
    descricao: z.string().optional(),
    thumbnail: z.string().url('Thumbnail deve ser uma URL válida.').max(250, 'Thumbnail deve ter no máximo 250 caracteres.').optional(),
    cargaHorariaTotal: z.number().positive('Carga horária total deve ser um número positivo.').min(1, 'Carga horária total é obrigatória.'),
    materialComplementar: z.array(z.string().url('Cada material deve ser uma URL válida.')).optional(),
    professores: z.array(z.string().min(1, 'Nome do professor é obrigatório.')).optional(),
    tags: z.array(z.string()).optional(),
    criadoPorId: objectIdSchema // ID do usuário que criou o curso, deve ser validado
});

const CursoUpdateSchema = CursoSchema.partial(); // Todos os campos são opcionais para atualização

export { CursoSchema, CursoUpdateSchema };
