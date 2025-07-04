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
});