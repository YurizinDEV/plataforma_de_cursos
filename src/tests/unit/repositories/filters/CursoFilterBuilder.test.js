// src/tests/unit/repositories/filters/CursoFilterBuilder.test.js
import mongoose from 'mongoose';
import CursoFilterBuilder from '../../../../repositories/filters/CursoFilterBuilder.js';

describe('CursoFilterBuilder', () => {
    let filterBuilder;

    beforeEach(() => {
        filterBuilder = new CursoFilterBuilder();
    });

    test('deve retornar filtro vazio quando nenhuma condição é aplicada', () => {
        const filtro = filterBuilder.build();
        expect(filtro).toEqual({});
    });

    describe('comTitulo()', () => {
        test('deve adicionar filtro de título quando valor é válido', () => {
            filterBuilder.comTitulo('JavaScript');
            const filtro = filterBuilder.build();

            expect(filtro).toHaveProperty('titulo');
            expect(filtro.titulo).toHaveProperty('$regex', 'JavaScript');
            expect(filtro.titulo).toHaveProperty('$options', 'i');
        });

        test('não deve adicionar filtro de título quando valor é vazio', () => {
            filterBuilder.comTitulo('');
            const filtro = filterBuilder.build();

            expect(filtro).not.toHaveProperty('titulo');
        });

        test('não deve adicionar filtro de título quando valor é apenas espaços', () => {
            filterBuilder.comTitulo('   ');
            const filtro = filterBuilder.build();

            expect(filtro).not.toHaveProperty('titulo');
        });

        test('não deve adicionar filtro de título quando valor é null ou undefined', () => {
            filterBuilder.comTitulo(null);
            let filtro = filterBuilder.build();
            expect(filtro).not.toHaveProperty('titulo');

            filterBuilder = new CursoFilterBuilder();
            filterBuilder.comTitulo(undefined);
            filtro = filterBuilder.build();
            expect(filtro).not.toHaveProperty('titulo');
        });
    });

    describe('comTags()', () => {
        test('deve adicionar filtro de tags quando array é válido', () => {
            filterBuilder.comTags(['javascript', 'node']);
            const filtro = filterBuilder.build();

            expect(filtro).toHaveProperty('tags');
            expect(filtro.tags).toHaveProperty('$in');
            expect(filtro.tags.$in).toContain('javascript');
            expect(filtro.tags.$in).toContain('node');
        });

        test('deve adicionar filtro de tags quando string é válida', () => {
            filterBuilder.comTags('javascript');
            const filtro = filterBuilder.build();

            expect(filtro).toHaveProperty('tags');
            expect(filtro.tags).toHaveProperty('$in');
            expect(filtro.tags.$in).toContain('javascript');
        });

        test('deve filtrar valores vazios em array de tags', () => {
            filterBuilder.comTags(['javascript', '', '   ', 'node']);
            const filtro = filterBuilder.build();

            expect(filtro).toHaveProperty('tags');
            expect(filtro.tags).toHaveProperty('$in');
            expect(filtro.tags.$in).toHaveLength(2);
            expect(filtro.tags.$in).toContain('javascript');
            expect(filtro.tags.$in).toContain('node');
        });

        test('não deve adicionar filtro de tags quando valor é array vazio', () => {
            filterBuilder.comTags([]);
            const filtro = filterBuilder.build();

            expect(filtro).not.toHaveProperty('tags');
        });

        test('não deve adicionar filtro de tags quando valor é null ou undefined', () => {
            filterBuilder.comTags(null);
            let filtro = filterBuilder.build();
            expect(filtro).not.toHaveProperty('tags');

            filterBuilder = new CursoFilterBuilder();
            filterBuilder.comTags(undefined);
            filtro = filterBuilder.build();
            expect(filtro).not.toHaveProperty('tags');
        });
    });

    describe('comProfessores()', () => {
        test('deve adicionar filtro de professores quando array é válido', () => {
            filterBuilder.comProfessores(['João Silva', 'Maria Santos']);
            const filtro = filterBuilder.build();

            expect(filtro).toHaveProperty('professores');
            expect(filtro.professores).toHaveProperty('$in');
            expect(filtro.professores.$in).toContain('João Silva');
            expect(filtro.professores.$in).toContain('Maria Santos');
        });

        test('deve adicionar filtro de professores quando string é válida', () => {
            filterBuilder.comProfessores('João Silva');
            const filtro = filterBuilder.build();

            expect(filtro).toHaveProperty('professores');
            expect(filtro.professores).toHaveProperty('$in');
            expect(filtro.professores.$in).toContain('João Silva');
        });

        test('deve filtrar valores vazios em array de professores', () => {
            filterBuilder.comProfessores(['João Silva', '', '   ', 'Maria Santos']);
            const filtro = filterBuilder.build();

            expect(filtro).toHaveProperty('professores');
            expect(filtro.professores).toHaveProperty('$in');
            expect(filtro.professores.$in).toHaveLength(2);
            expect(filtro.professores.$in).toContain('João Silva');
            expect(filtro.professores.$in).toContain('Maria Santos');
        });

        test('não deve adicionar filtro de professores quando valor é array vazio', () => {
            filterBuilder.comProfessores([]);
            const filtro = filterBuilder.build();

            expect(filtro).not.toHaveProperty('professores');
        });

        test('não deve adicionar filtro de professores quando valor é null ou undefined', () => {
            filterBuilder.comProfessores(null);
            let filtro = filterBuilder.build();
            expect(filtro).not.toHaveProperty('professores');

            filterBuilder = new CursoFilterBuilder();
            filterBuilder.comProfessores(undefined);
            filtro = filterBuilder.build();
            expect(filtro).not.toHaveProperty('professores');
        });
    });

    describe('comCargaHoraria()', () => {
        test('deve adicionar filtro com mínimo e máximo quando ambos são válidos', () => {
            filterBuilder.comCargaHoraria(10, 40);
            const filtro = filterBuilder.build();

            expect(filtro).toHaveProperty('cargaHorariaTotal');
            expect(filtro.cargaHorariaTotal).toHaveProperty('$gte', 10);
            expect(filtro.cargaHorariaTotal).toHaveProperty('$lte', 40);
        });

        test('deve adicionar filtro apenas com mínimo quando máximo não é informado', () => {
            filterBuilder.comCargaHoraria(10, null);
            const filtro = filterBuilder.build();

            expect(filtro).toHaveProperty('cargaHorariaTotal');
            expect(filtro.cargaHorariaTotal).toHaveProperty('$gte', 10);
            expect(filtro.cargaHorariaTotal).not.toHaveProperty('$lte');
        });

        test('deve adicionar filtro apenas com máximo quando mínimo não é informado', () => {
            filterBuilder.comCargaHoraria(null, 40);
            const filtro = filterBuilder.build();

            expect(filtro).toHaveProperty('cargaHorariaTotal');
            expect(filtro.cargaHorariaTotal).not.toHaveProperty('$gte');
            expect(filtro.cargaHorariaTotal).toHaveProperty('$lte', 40);
        });

        test('deve converter strings numéricas para inteiros', () => {
            filterBuilder.comCargaHoraria('15', '35');
            const filtro = filterBuilder.build();

            expect(filtro).toHaveProperty('cargaHorariaTotal');
            expect(filtro.cargaHorariaTotal).toHaveProperty('$gte', 15);
            expect(filtro.cargaHorariaTotal).toHaveProperty('$lte', 35);
        });

        test('não deve adicionar filtro de carga horária quando valores são inválidos', () => {
            filterBuilder.comCargaHoraria(NaN, 'abc');
            const filtro = filterBuilder.build();

            expect(filtro).not.toHaveProperty('cargaHorariaTotal');
        });

        test('não deve adicionar filtro de carga horária quando ambos valores são null ou undefined', () => {
            filterBuilder.comCargaHoraria(null, undefined);
            const filtro = filterBuilder.build();

            expect(filtro).not.toHaveProperty('cargaHorariaTotal');
        });
    });

    describe('comCriadoPor()', () => {
        test('deve adicionar filtro de criadoPorId quando valor é válido', () => {
            const objectId = new mongoose.Types.ObjectId().toString();
            filterBuilder.comCriadoPor(objectId);
            const filtro = filterBuilder.build();

            expect(filtro).toHaveProperty('criadoPorId', objectId);
        });

        test('não deve adicionar filtro de criadoPorId quando valor é vazio', () => {
            filterBuilder.comCriadoPor('');
            const filtro = filterBuilder.build();

            expect(filtro).not.toHaveProperty('criadoPorId');
        });

        test('não deve adicionar filtro de criadoPorId quando valor é apenas espaços', () => {
            filterBuilder.comCriadoPor('   ');
            const filtro = filterBuilder.build();

            expect(filtro).not.toHaveProperty('criadoPorId');
        });

        test('não deve adicionar filtro de criadoPorId quando valor é null ou undefined', () => {
            filterBuilder.comCriadoPor(null);
            let filtro = filterBuilder.build();
            expect(filtro).not.toHaveProperty('criadoPorId');

            filterBuilder = new CursoFilterBuilder();
            filterBuilder.comCriadoPor(undefined);
            filtro = filterBuilder.build();
            expect(filtro).not.toHaveProperty('criadoPorId');
        });
    });

    describe('combinação de filtros', () => {
        test('deve combinar múltiplos filtros corretamente', () => {
            const objectId = new mongoose.Types.ObjectId().toString();

            filterBuilder
                .comTitulo('JavaScript')
                .comTags(['node', 'web'])
                .comProfessores(['João Silva'])
                .comCargaHoraria(10, 40)
                .comCriadoPor(objectId);

            const filtro = filterBuilder.build();

            expect(filtro).toHaveProperty('titulo');
            expect(filtro).toHaveProperty('tags');
            expect(filtro).toHaveProperty('professores');
            expect(filtro).toHaveProperty('cargaHorariaTotal');
            expect(filtro).toHaveProperty('criadoPorId', objectId);

            expect(filtro.titulo.$regex).toBe('JavaScript');
            expect(filtro.tags.$in).toContain('node');
            expect(filtro.tags.$in).toContain('web');
            expect(filtro.professores.$in).toContain('João Silva');
            expect(filtro.cargaHorariaTotal.$gte).toBe(10);
            expect(filtro.cargaHorariaTotal.$lte).toBe(40);
        });

        test('deve retornar apenas filtros válidos ao combinar filtros', () => {
            filterBuilder
                .comTitulo('JavaScript')
                .comTags([])
                .comProfessores(null)
                .comCargaHoraria(10, 40)
                .comCriadoPor('');

            const filtro = filterBuilder.build();

            expect(filtro).toHaveProperty('titulo');
            expect(filtro).toHaveProperty('cargaHorariaTotal');
            expect(filtro).not.toHaveProperty('tags');
            expect(filtro).not.toHaveProperty('professores');
            expect(filtro).not.toHaveProperty('criadoPorId');
        });
    });
});