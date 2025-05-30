// src/tests/unit/utils/validators/schemas/zod/CursoSchema.test.js
import {
    CursoSchema,
    CursoUpdateSchema
} from '../../../../../../utils/validators/schemas/zod/CursoSchema.js';
import mongoose from 'mongoose';

describe('CursoSchema', () => {
    const objectId = new mongoose.Types.ObjectId().toString();

    const cursoValido = {
        titulo: 'Curso de Teste',
        descricao: 'Uma descrição para o curso de teste',
        thumbnail: 'https://example.com/thumbnail.jpg',
        cargaHorariaTotal: 20,
        materialComplementar: ['https://example.com/material1.pdf'],
        professores: ['Professor Teste'],
        tags: ['teste', 'curso'],
        criadoPorId: objectId
    };

    test('deve validar um curso com todos os campos válidos', () => {
        const resultado = CursoSchema.safeParse(cursoValido);
        expect(resultado.success).toBe(true);
    });

    test('deve validar um curso apenas com campos obrigatórios', () => {
        const cursoMinimo = {
            titulo: 'Curso Mínimo',
            criadoPorId: objectId
        };

        const resultado = CursoSchema.safeParse(cursoMinimo);
        expect(resultado.success).toBe(true);
        expect(resultado.data.cargaHorariaTotal).toBe(0); // Verifica valor padrão
    });

    test('deve rejeitar um curso sem título', () => {
        const cursoSemTitulo = {
            ...cursoValido
        };
        delete cursoSemTitulo.titulo;

        const resultado = CursoSchema.safeParse(cursoSemTitulo);
        expect(resultado.success).toBe(false);
    });

    test('deve rejeitar um curso sem criadoPorId', () => {
        const cursoSemCriador = {
            ...cursoValido
        };
        delete cursoSemCriador.criadoPorId;

        const resultado = CursoSchema.safeParse(cursoSemCriador);
        expect(resultado.success).toBe(false);
    });

    test('deve rejeitar um curso com criadoPorId inválido', () => {
        const cursoComCriadorInvalido = {
            ...cursoValido,
            criadoPorId: 'id-invalido'
        };

        const resultado = CursoSchema.safeParse(cursoComCriadorInvalido);
        expect(resultado.success).toBe(false);
    });

    test('deve rejeitar um curso com cargaHorariaTotal negativa', () => {
        const cursoComCargaNegativa = {
            ...cursoValido,
            cargaHorariaTotal: -1
        };

        const resultado = CursoSchema.safeParse(cursoComCargaNegativa);
        expect(resultado.success).toBe(false);
    });

    test('deve validar um curso com cargaHorariaTotal zero', () => {
        const cursoComCargaZero = {
            ...cursoValido,
            cargaHorariaTotal: 0
        };

        const resultado = CursoSchema.safeParse(cursoComCargaZero);
        expect(resultado.success).toBe(true);
    });

    test('deve rejeitar um curso com URL de thumbnail inválida', () => {
        const cursoComThumbnailInvalida = {
            ...cursoValido,
            thumbnail: 'url-invalida'
        };

        const resultado = CursoSchema.safeParse(cursoComThumbnailInvalida);
        expect(resultado.success).toBe(false);
    });

    test('deve rejeitar um curso com URL de material complementar inválida', () => {
        const cursoComMaterialInvalido = {
            ...cursoValido,
            materialComplementar: ['url-invalida']
        };

        const resultado = CursoSchema.safeParse(cursoComMaterialInvalido);
        expect(resultado.success).toBe(false);
    });

    test('deve validar um curso sem professores', () => {
        const cursoSemProfessores = {
            ...cursoValido
        };
        delete cursoSemProfessores.professores;

        const resultado = CursoSchema.safeParse(cursoSemProfessores);
        expect(resultado.success).toBe(true);
    });

    test('deve validar um curso sem tags', () => {
        const cursoSemTags = {
            ...cursoValido
        };
        delete cursoSemTags.tags;

        const resultado = CursoSchema.safeParse(cursoSemTags);
        expect(resultado.success).toBe(true);
    });
});

describe('CursoUpdateSchema', () => {
    const objectId = new mongoose.Types.ObjectId().toString();

    test('deve validar atualização com todos os campos', () => {
        const atualizacaoCompleta = {
            titulo: 'Curso Atualizado',
            descricao: 'Nova descrição',
            thumbnail: 'https://example.com/nova-thumbnail.jpg',
            cargaHorariaTotal: 30,
            materialComplementar: ['https://example.com/novo-material.pdf'],
            professores: ['Novo Professor'],
            tags: ['atualizado'],
            criadoPorId: objectId
        };

        const resultado = CursoUpdateSchema.safeParse(atualizacaoCompleta);
        expect(resultado.success).toBe(true);
    });

    test('deve validar atualização parcial', () => {
        const atualizacaoParcial = {
            titulo: 'Novo Título',
            cargaHorariaTotal: 25
        };

        const resultado = CursoUpdateSchema.safeParse(atualizacaoParcial);
        expect(resultado.success).toBe(true);
    });

    test('deve validar atualização vazia', () => {
        const atualizacaoVazia = {};

        const resultado = CursoUpdateSchema.safeParse(atualizacaoVazia);
        expect(resultado.success).toBe(true);
    });

    test('deve rejeitar atualização com cargaHorariaTotal negativa', () => {
        const atualizacaoInvalida = {
            cargaHorariaTotal: -5
        };

        const resultado = CursoUpdateSchema.safeParse(atualizacaoInvalida);
        expect(resultado.success).toBe(false);
    });

    test('deve rejeitar atualização com URL de thumbnail inválida', () => {
        const atualizacaoInvalida = {
            thumbnail: 'url-invalida'
        };

        const resultado = CursoUpdateSchema.safeParse(atualizacaoInvalida);
        expect(resultado.success).toBe(false);
    });
});