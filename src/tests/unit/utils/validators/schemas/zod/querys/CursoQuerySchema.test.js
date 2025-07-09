// src/tests/unit/utils/validators/schemas/zod/querys/CursoQuerySchema.test.js
import {
    CursoIdSchema,
    CursoQuerySchema
} from '../../../../../../../utils/validators/schemas/zod/querys/CursoQuerySchema.js';
import mongoose from 'mongoose';

describe('CursoIdSchema', () => {
    test('deve validar um ID válido', () => {
        const id = new mongoose.Types.ObjectId().toString();
        const resultado = CursoIdSchema.safeParse(id);
        expect(resultado.success).toBe(true);
    });

    test('deve rejeitar um ID inválido', () => {
        const idInvalido = 'id-invalido';
        const resultado = CursoIdSchema.safeParse(idInvalido);
        expect(resultado.success).toBe(false);
    });
});

describe('CursoQuerySchema', () => {
    test('deve validar query com todos os campos válidos', () => {
        const objectId = new mongoose.Types.ObjectId().toString();
        const queryCompleta = {
            titulo: 'Curso Teste',
            cargaHorariaMin: 10,
            cargaHorariaMax: 40,
            tags: 'javascript,node',
            professores: 'Fulano,Ciclano',
            criadoPorId: objectId,
            page: 2,
            limit: 15
        };

        const resultado = CursoQuerySchema.safeParse(queryCompleta);
        expect(resultado.success).toBe(true);
        expect(resultado.data.tags).toEqual(['javascript', 'node']);
        expect(resultado.data.professores).toEqual(['Fulano', 'Ciclano']);
    });

    test('deve validar query vazia', () => {
        const queryVazia = {};

        const resultado = CursoQuerySchema.safeParse(queryVazia);
        expect(resultado.success).toBe(true);
    });

    test('deve validar query com apenas título', () => {
        const queryTitulo = {
            titulo: 'Curso JavaScript'
        };

        const resultado = CursoQuerySchema.safeParse(queryTitulo);
        expect(resultado.success).toBe(true);
    });

    test('deve transformar tags string em array', () => {
        const queryComTags = {
            tags: 'javascript,node,express'
        };

        const resultado = CursoQuerySchema.safeParse(queryComTags);
        expect(resultado.success).toBe(true);
        expect(resultado.data.tags).toEqual(['javascript', 'node', 'express']);
    });

    test('deve transformar professores string em array', () => {
        const queryComProfessores = {
            professores: 'Fulano,Ciclano,Beltrano'
        };

        const resultado = CursoQuerySchema.safeParse(queryComProfessores);
        expect(resultado.success).toBe(true);
        expect(resultado.data.professores).toEqual(['Fulano', 'Ciclano', 'Beltrano']);
    });

    test('deve rejeitar cargaHorariaMin negativa', () => {
        const queryInvalida = {
            cargaHorariaMin: -5
        };

        const resultado = CursoQuerySchema.safeParse(queryInvalida);
        expect(resultado.success).toBe(false);
    });

    test('deve rejeitar cargaHorariaMax negativa', () => {
        const queryInvalida = {
            cargaHorariaMax: -10
        };

        const resultado = CursoQuerySchema.safeParse(queryInvalida);
        expect(resultado.success).toBe(false);
    });

    test('deve rejeitar page não positiva', () => {
        const queryInvalida = {
            page: 0
        };

        const resultado = CursoQuerySchema.safeParse(queryInvalida);
        expect(resultado.success).toBe(false);
    });

    test('deve rejeitar limit não positivo', () => {
        const queryInvalida = {
            limit: 0
        };

        const resultado = CursoQuerySchema.safeParse(queryInvalida);
        expect(resultado.success).toBe(false);
    });

    test('deve rejeitar criadoPorId inválido', () => {
        const queryInvalida = {
            criadoPorId: 'id-invalido'
        };

        const resultado = CursoQuerySchema.safeParse(queryInvalida);
        expect(resultado.success).toBe(false);
    });

    test('deve converter valores numéricos de string para number', () => {
        const queryComStrings = {
            cargaHorariaMin: '10',
            cargaHorariaMax: '40',
            page: '2',
            limit: '15'
        };

        const resultado = CursoQuerySchema.safeParse(queryComStrings);
        expect(resultado.success).toBe(true);
        expect(resultado.data.cargaHorariaMin).toBe(10);
        expect(resultado.data.cargaHorariaMax).toBe(40);
        expect(resultado.data.page).toBe(2);
        expect(resultado.data.limit).toBe(15);
    });

    test('deve validar filtros AND alternativos (tag1, tag2, tag3, professor1, professor2, professor3)', () => {
        const query = {
            tag1: 'js',
            tag2: 'node',
            tag3: 'api',
            professor1: 'Prof1',
            professor2: 'Prof2',
            professor3: 'Prof3'
        };
        const resultado = CursoQuerySchema.safeParse(query);
        expect(resultado.success).toBe(true);
        expect(resultado.data.tag1).toBe('js');
        expect(resultado.data.professor3).toBe('Prof3');
    });

    test('deve validar filtros via array (tags[], professores[])', () => {
        const query = {
            'tags[]': ['js', 'node'],
            'professores[]': ['Prof1', 'Prof2']
        };
        const resultado = CursoQuerySchema.safeParse(query);
        expect(resultado.success).toBe(true);
        expect(resultado.data['tags[]']).toEqual(['js', 'node']);
        expect(resultado.data['professores[]']).toEqual(['Prof1', 'Prof2']);
    });

    test('deve validar filtros via string única (tags[], professores[])', () => {
        const query = {
            'tags[]': 'js',
            'professores[]': 'Prof1'
        };
        const resultado = CursoQuerySchema.safeParse(query);
        expect(resultado.success).toBe(true);
        expect(resultado.data['tags[]']).toBe('js');
        expect(resultado.data['professores[]']).toBe('Prof1');
    });

    test('deve validar campos de busca alternativos', () => {
        const query = {
            tituloExato: 'Curso JavaScript Avançado',
            descricao: 'Descrição do curso',
            buscaGeral: 'javascript programação',
            todasTags: 'dev',
            todosProfessores: 'Prof Experiente'
        };
        const resultado = CursoQuerySchema.safeParse(query);
        expect(resultado.success).toBe(true);
        expect(resultado.data.tituloExato).toBe('Curso JavaScript Avançado');
        expect(resultado.data.descricao).toBe('Descrição do curso');
        expect(resultado.data.buscaGeral).toBe('javascript programação');
    });

    test('deve validar cargaHorariaFaixa enum', () => {
        const queryCurta = { cargaHorariaFaixa: 'curta' };
        const queryMedia = { cargaHorariaFaixa: 'media' };
        const queryLonga = { cargaHorariaFaixa: 'longa' };

        expect(CursoQuerySchema.safeParse(queryCurta).success).toBe(true);
        expect(CursoQuerySchema.safeParse(queryMedia).success).toBe(true);
        expect(CursoQuerySchema.safeParse(queryLonga).success).toBe(true);
    });

    test('deve rejeitar cargaHorariaFaixa inválida', () => {
        const queryInvalida = { cargaHorariaFaixa: 'extra-longa' };
        const resultado = CursoQuerySchema.safeParse(queryInvalida);
        expect(resultado.success).toBe(false);
    });

    test('deve validar campos de data datetime', () => {
        const query = {
            criadoApos: '2024-01-01T00:00:00.000Z',
            criadoAntes: '2024-12-31T23:59:59.999Z',
            atualizadoApos: '2024-06-01T10:30:00.000Z'
        };
        const resultado = CursoQuerySchema.safeParse(query);
        expect(resultado.success).toBe(true);
        expect(resultado.data.criadoApos).toBe('2024-01-01T00:00:00.000Z');
    });

    test('deve rejeitar datas em formato inválido', () => {
        const queryInvalida = {
            criadoApos: '2024-01-01',
            criadoAntes: 'data-invalida'
        };
        const resultado = CursoQuerySchema.safeParse(queryInvalida);
        expect(resultado.success).toBe(false);
    });

    test('deve validar temMaterialComplementar como boolean', () => {
        const queryBoolean = { temMaterialComplementar: true };
        const resultado = CursoQuerySchema.safeParse(queryBoolean);
        expect(resultado.success).toBe(true);
        expect(resultado.data.temMaterialComplementar).toBe(true);
    });

    test('deve transformar temMaterialComplementar string em boolean', () => {
        const queryTrue = { temMaterialComplementar: 'true' };
        const queryFalse = { temMaterialComplementar: 'false' };
        const query1 = { temMaterialComplementar: '1' };
        const query0 = { temMaterialComplementar: '0' };

        expect(CursoQuerySchema.safeParse(queryTrue).data.temMaterialComplementar).toBe(true);
        expect(CursoQuerySchema.safeParse(queryFalse).data.temMaterialComplementar).toBe(false);
        expect(CursoQuerySchema.safeParse(query1).data.temMaterialComplementar).toBe(true);
        expect(CursoQuerySchema.safeParse(query0).data.temMaterialComplementar).toBe(false);
    });

    test('deve validar temThumbnail como boolean', () => {
        const queryBoolean = { temThumbnail: false };
        const resultado = CursoQuerySchema.safeParse(queryBoolean);
        expect(resultado.success).toBe(true);
        expect(resultado.data.temThumbnail).toBe(false);
    });

    test('deve transformar temThumbnail string em boolean', () => {
        const queryTrue = { temThumbnail: 'true' };
        const queryFalse = { temThumbnail: 'false' };
        const query1 = { temThumbnail: '1' };
        const query0 = { temThumbnail: '0' };

        expect(CursoQuerySchema.safeParse(queryTrue).data.temThumbnail).toBe(true);
        expect(CursoQuerySchema.safeParse(queryFalse).data.temThumbnail).toBe(false);
        expect(CursoQuerySchema.safeParse(query1).data.temThumbnail).toBe(true);
        expect(CursoQuerySchema.safeParse(query0).data.temThumbnail).toBe(false);
    });

    test('deve rejeitar valores inválidos para temMaterialComplementar', () => {
        const queryInvalida = { temMaterialComplementar: 'sim' };
        const resultado = CursoQuerySchema.safeParse(queryInvalida);
        expect(resultado.success).toBe(false);
    });

    test('deve validar todos os valores de status enum', () => {
        const statusValues = ['ativo', 'inativo', 'rascunho', 'arquivado'];
        
        statusValues.forEach(status => {
            const query = { status };
            const resultado = CursoQuerySchema.safeParse(query);
            expect(resultado.success).toBe(true);
            expect(resultado.data.status).toBe(status);
        });
    });

    test('deve rejeitar status inválido', () => {
        const queryInvalida = { status: 'pendente' };
        const resultado = CursoQuerySchema.safeParse(queryInvalida);
        expect(resultado.success).toBe(false);
    });

    test('deve validar quantidadeAulasMin e quantidadeAulasMax', () => {
        const query = {
            quantidadeAulasMin: 5,
            quantidadeAulasMax: 20
        };
        const resultado = CursoQuerySchema.safeParse(query);
        expect(resultado.success).toBe(true);
        expect(resultado.data.quantidadeAulasMin).toBe(5);
        expect(resultado.data.quantidadeAulasMax).toBe(20);
    });

    test('deve rejeitar quantidadeAulas negativas', () => {
        const queryMin = { quantidadeAulasMin: -1 };
        const queryMax = { quantidadeAulasMax: -5 };
        
        expect(CursoQuerySchema.safeParse(queryMin).success).toBe(false);
        expect(CursoQuerySchema.safeParse(queryMax).success).toBe(false);
    });

    test('deve validar todos os valores de ordenarPor enum', () => {
        const ordenarPorValues = ['titulo', 'createdAt', 'updatedAt', 'cargaHorariaTotal', 'status'];
        
        ordenarPorValues.forEach(ordenarPor => {
            const query = { ordenarPor };
            const resultado = CursoQuerySchema.safeParse(query);
            expect(resultado.success).toBe(true);
            expect(resultado.data.ordenarPor).toBe(ordenarPor);
        });
    });

    test('deve rejeitar ordenarPor inválido', () => {
        const queryInvalida = { ordenarPor: 'prioridade' };
        const resultado = CursoQuerySchema.safeParse(queryInvalida);
        expect(resultado.success).toBe(false);
    });

    test('deve validar direcaoOrdem enum', () => {
        const queryAsc = { direcaoOrdem: 'asc' };
        const queryDesc = { direcaoOrdem: 'desc' };
        
        expect(CursoQuerySchema.safeParse(queryAsc).success).toBe(true);
        expect(CursoQuerySchema.safeParse(queryDesc).success).toBe(true);
        expect(CursoQuerySchema.safeParse(queryAsc).data.direcaoOrdem).toBe('asc');
        expect(CursoQuerySchema.safeParse(queryDesc).data.direcaoOrdem).toBe('desc');
    });

    test('deve rejeitar direcaoOrdem inválida', () => {
        const queryInvalida = { direcaoOrdem: 'crescente' };
        const resultado = CursoQuerySchema.safeParse(queryInvalida);
        expect(resultado.success).toBe(false);
    });

    test('deve converter strings numéricas para quantidadeAulas', () => {
        const query = {
            quantidadeAulasMin: '3',
            quantidadeAulasMax: '15'
        };
        const resultado = CursoQuerySchema.safeParse(query);
        expect(resultado.success).toBe(true);
        expect(resultado.data.quantidadeAulasMin).toBe(3);
        expect(resultado.data.quantidadeAulasMax).toBe(15);
    });

    test('deve validar query complexa com múltiplos campos', () => {
        const objectId = new mongoose.Types.ObjectId().toString();
        const queryCompleta = {
            titulo: 'Curso Completo',
            tituloExato: 'Curso Completo de JavaScript',
            descricao: 'Um curso abrangente',
            buscaGeral: 'javascript avançado',
            cargaHorariaMin: 20,
            cargaHorariaMax: 50,
            cargaHorariaFaixa: 'media',
            tags: 'javascript,node,express',
            professores: 'Prof1,Prof2',
            tag1: 'frontend',
            professor1: 'Prof Expert',
            criadoPorId: objectId,
            criadoApos: '2024-01-01T00:00:00.000Z',
            temMaterialComplementar: 'true',
            temThumbnail: '1',
            status: 'ativo',
            quantidadeAulasMin: 10,
            quantidadeAulasMax: 30,
            ordenarPor: 'titulo',
            direcaoOrdem: 'asc',
            page: 1,
            limit: 20
        };

        const resultado = CursoQuerySchema.safeParse(queryCompleta);
        expect(resultado.success).toBe(true);
        expect(resultado.data.tags).toEqual(['javascript', 'node', 'express']);
        expect(resultado.data.temMaterialComplementar).toBe(true);
        expect(resultado.data.temThumbnail).toBe(true);
    });

    test('deve validar tags com espaços em branco', () => {
        const query = {
            tags: ' javascript , node.js , express '
        };
        const resultado = CursoQuerySchema.safeParse(query);
        expect(resultado.success).toBe(true);
        expect(resultado.data.tags).toEqual(['javascript', 'node.js', 'express']);
    });

    test('deve validar professores com espaços em branco', () => {
        const query = {
            professores: ' João Silva , Maria Santos , Pedro Oliveira '
        };
        const resultado = CursoQuerySchema.safeParse(query);
        expect(resultado.success).toBe(true);
        expect(resultado.data.professores).toEqual(['João Silva', 'Maria Santos', 'Pedro Oliveira']);
    });
});