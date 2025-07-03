// src/tests/unit/repositories/filters/CursoFilterBuilder.test.js
import mongoose from 'mongoose';
import CursoFilterBuilder from '../../../../repositories/filters/CursoFilterBuilder.js';

describe('CursoFilterBuilder', () => {
    let filterBuilder;

    beforeEach(() => {
        filterBuilder = new CursoFilterBuilder();
    });


    const extrairFiltros = (resultado) => {
        return resultado.filtros || resultado;
    };

    test('deve retornar filtro vazio quando nenhuma condição é aplicada', () => {
        const resultado = filterBuilder.build();
        expect(resultado).toEqual({});
    });

    describe('comTitulo()', () => {
        test('deve adicionar filtro de título quando valor é válido', () => {
            filterBuilder.comTitulo('JavaScript');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('titulo');
            expect(filtro.titulo).toHaveProperty('$regex', 'JavaScript');
            expect(filtro.titulo).toHaveProperty('$options', 'i');
        });

        test('não deve adicionar filtro de título quando valor é vazio', () => {
            filterBuilder.comTitulo('');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).not.toHaveProperty('titulo');
        });

        test('não deve adicionar filtro de título quando valor é apenas espaços', () => {
            filterBuilder.comTitulo('   ');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).not.toHaveProperty('titulo');
        });

        test('não deve adicionar filtro de título quando valor é null ou undefined', () => {
            filterBuilder.comTitulo(null);
            let resultado = filterBuilder.build();
            let filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('titulo');

            filterBuilder = new CursoFilterBuilder();
            filterBuilder.comTitulo(undefined);
            resultado = filterBuilder.build();
            filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('titulo');
        });
    });

    describe('comTags()', () => {
        test('deve adicionar filtro de tags quando array é válido', () => {
            filterBuilder.comTags(['javascript', 'node']);
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('tags');
            expect(filtro.tags).toHaveProperty('$in');
            expect(filtro.tags.$in).toContain('javascript');
            expect(filtro.tags.$in).toContain('node');
        });

        test('deve adicionar filtro de tags quando string é válida', () => {
            filterBuilder.comTags('javascript');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('tags');
            expect(filtro.tags).toHaveProperty('$in');
            expect(filtro.tags.$in).toContain('javascript');
        });

        test('deve filtrar valores vazios em array de tags', () => {
            filterBuilder.comTags(['javascript', '', '   ', 'node']);
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('tags');
            expect(filtro.tags).toHaveProperty('$in');
            expect(filtro.tags.$in).toHaveLength(2);
            expect(filtro.tags.$in).toContain('javascript');
            expect(filtro.tags.$in).toContain('node');
        });

        test('não deve adicionar filtro de tags quando valor é array vazio', () => {
            filterBuilder.comTags([]);
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

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
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('professores');
            expect(filtro.professores).toHaveProperty('$in');
            expect(filtro.professores.$in).toContain('João Silva');
            expect(filtro.professores.$in).toContain('Maria Santos');
        });

        test('deve adicionar filtro de professores quando string é válida', () => {
            filterBuilder.comProfessores('João Silva');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('professores');
            expect(filtro.professores).toHaveProperty('$in');
            expect(filtro.professores.$in).toContain('João Silva');
        });

        test('deve filtrar valores vazios em array de professores', () => {
            filterBuilder.comProfessores(['João Silva', '', '   ', 'Maria Santos']);
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('professores');
            expect(filtro.professores).toHaveProperty('$in');
            expect(filtro.professores.$in).toHaveLength(2);
            expect(filtro.professores.$in).toContain('João Silva');
            expect(filtro.professores.$in).toContain('Maria Santos');
        });

        test('não deve adicionar filtro de professores quando valor é array vazio', () => {
            filterBuilder.comProfessores([]);
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

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
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('cargaHorariaTotal');
            expect(filtro.cargaHorariaTotal).toHaveProperty('$gte', 10);
            expect(filtro.cargaHorariaTotal).toHaveProperty('$lte', 40);
        });

        test('deve adicionar filtro apenas com mínimo quando máximo não é informado', () => {
            filterBuilder.comCargaHoraria(10, null);
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('cargaHorariaTotal');
            expect(filtro.cargaHorariaTotal).toHaveProperty('$gte', 10);
            expect(filtro.cargaHorariaTotal).not.toHaveProperty('$lte');
        });

        test('deve adicionar filtro apenas com máximo quando mínimo não é informado', () => {
            filterBuilder.comCargaHoraria(null, 40);
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('cargaHorariaTotal');
            expect(filtro.cargaHorariaTotal).not.toHaveProperty('$gte');
            expect(filtro.cargaHorariaTotal).toHaveProperty('$lte', 40);
        });

        test('deve converter strings numéricas para inteiros', () => {
            filterBuilder.comCargaHoraria('15', '35');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('cargaHorariaTotal');
            expect(filtro.cargaHorariaTotal).toHaveProperty('$gte', 15);
            expect(filtro.cargaHorariaTotal).toHaveProperty('$lte', 35);
        });

        test('não deve adicionar filtro de carga horária quando valores são inválidos', () => {
            filterBuilder.comCargaHoraria(NaN, 'abc');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).not.toHaveProperty('cargaHorariaTotal');
        });

        test('não deve adicionar filtro de carga horária quando ambos valores são null ou undefined', () => {
            filterBuilder.comCargaHoraria(null, undefined);
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).not.toHaveProperty('cargaHorariaTotal');
        });
    });

    describe('comCriadoPor()', () => {
        test('deve adicionar filtro de criadoPorId quando valor é válido', () => {
            const objectId = new mongoose.Types.ObjectId().toString();
            filterBuilder.comCriadoPor(objectId);
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('criadoPorId', objectId);
        });

        test('não deve adicionar filtro de criadoPorId quando valor é vazio', () => {
            filterBuilder.comCriadoPor('');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).not.toHaveProperty('criadoPorId');
        });

        test('não deve adicionar filtro de criadoPorId quando valor é apenas espaços', () => {
            filterBuilder.comCriadoPor('   ');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

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

            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

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

            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('titulo');
            expect(filtro).toHaveProperty('cargaHorariaTotal');
            expect(filtro).not.toHaveProperty('tags');
            expect(filtro).not.toHaveProperty('professores');
            expect(filtro).not.toHaveProperty('criadoPorId');
        });
    });

    describe('Novos filtros avançados', () => {
        describe('comTodasTags() e comTodosProfessores()', () => {
            test('deve aplicar filtro AND para todas as tags', () => {
                filterBuilder.comTodasTags(['javascript', 'node', 'backend']);
                const resultado = filterBuilder.build();
                const filtro = extrairFiltros(resultado);

                expect(filtro).toHaveProperty('tags');
                expect(filtro.tags).toHaveProperty('$all');
                expect(filtro.tags.$all).toEqual(['javascript', 'node', 'backend']);
            });

            test('deve aplicar filtro AND para todos os professores', () => {
                filterBuilder.comTodosProfessores(['João Silva', 'Maria Santos']);
                const resultado = filterBuilder.build();
                const filtro = extrairFiltros(resultado);

                expect(filtro).toHaveProperty('professores');
                expect(filtro.professores).toHaveProperty('$all');
                expect(filtro.professores.$all).toEqual(['João Silva', 'Maria Santos']);
            });
        });

        describe('Filtros de busca textual', () => {
            test('deve aplicar busca exata por título', () => {
                filterBuilder.comTituloExato('JavaScript Avançado');
                const resultado = filterBuilder.build();
                const filtro = extrairFiltros(resultado);

                expect(filtro).toHaveProperty('titulo', 'JavaScript Avançado');
            });

            test('deve aplicar busca na descrição', () => {
                filterBuilder.comDescricao('curso completo');
                const resultado = filterBuilder.build();
                const filtro = extrairFiltros(resultado);

                expect(filtro).toHaveProperty('descricao');
                expect(filtro.descricao).toHaveProperty('$regex', 'curso completo');
                expect(filtro.descricao).toHaveProperty('$options', 'i');
            });

            test('deve aplicar busca geral', () => {
                filterBuilder.comBuscaGeral('programação');
                const resultado = filterBuilder.build();
                const filtro = extrairFiltros(resultado);

                expect(filtro).toHaveProperty('$or');
                expect(filtro.$or).toHaveLength(3);
            });
        });

        describe('Filtros de carga horária inteligente', () => {
            test('deve aplicar filtro para cursos curtos', () => {
                filterBuilder.comCargaHorariaFaixa('curta');
                const resultado = filterBuilder.build();
                const filtro = extrairFiltros(resultado);

                expect(filtro.cargaHorariaTotal.$gte).toBe(0);
                expect(filtro.cargaHorariaTotal.$lte).toBe(20);
            });

            test('deve aplicar filtro para cursos médios', () => {
                filterBuilder.comCargaHorariaFaixa('media');
                const resultado = filterBuilder.build();
                const filtro = extrairFiltros(resultado);

                expect(filtro.cargaHorariaTotal.$gte).toBe(21);
                expect(filtro.cargaHorariaTotal.$lte).toBe(50);
            });

            test('deve aplicar filtro para cursos longos', () => {
                filterBuilder.comCargaHorariaFaixa('longa');
                const resultado = filterBuilder.build();
                const filtro = extrairFiltros(resultado);

                expect(filtro.cargaHorariaTotal.$gte).toBe(51);
                expect(filtro.cargaHorariaTotal).not.toHaveProperty('$lte');
            });
        });

        describe('Filtros de conteúdo', () => {
            test('deve filtrar cursos com material complementar', () => {
                filterBuilder.comMaterialComplementar(true);
                const resultado = filterBuilder.build();
                const filtro = extrairFiltros(resultado);

                expect(filtro.materialComplementar.$exists).toBe(true);
                expect(filtro.materialComplementar.$not.$size).toBe(0);
            });

            test('deve aceitar diferentes formatos para filtro de material complementar', () => {

                filterBuilder.comMaterialComplementar('true');
                let resultado = filterBuilder.build();
                let filtro = extrairFiltros(resultado);
                expect(filtro.materialComplementar.$exists).toBe(true);


                filterBuilder.reset();
                filterBuilder.comMaterialComplementar('1');
                resultado = filterBuilder.build();
                filtro = extrairFiltros(resultado);
                expect(filtro.materialComplementar.$exists).toBe(true);


                filterBuilder.reset();
                filterBuilder.comMaterialComplementar('false');
                resultado = filterBuilder.build();
                filtro = extrairFiltros(resultado);
                expect(filtro).toHaveProperty('$or');


                filterBuilder.reset();
                filterBuilder.comMaterialComplementar('0');
                resultado = filterBuilder.build();
                filtro = extrairFiltros(resultado);
                expect(filtro).toHaveProperty('$or');
            });

            test('deve filtrar cursos sem thumbnail', () => {
                filterBuilder.comThumbnail(false);
                const resultado = filterBuilder.build();
                const filtro = extrairFiltros(resultado);

                expect(filtro).toHaveProperty('$or');
                expect(filtro.$or).toHaveLength(2);
            });
        });

        describe('Métodos utilitários', () => {
            test('deve resetar filtros', () => {
                filterBuilder.comTitulo('teste').comTags(['tag']);
                expect(filterBuilder.temFiltros()).toBe(true);

                filterBuilder.reset();
                expect(filterBuilder.temFiltros()).toBe(false);
                expect(filterBuilder.build()).toEqual({});
            });

            test('deve verificar se tem filtros aplicados', () => {
                expect(filterBuilder.temFiltros()).toBe(false);

                filterBuilder.comTitulo('teste');
                expect(filterBuilder.temFiltros()).toBe(true);
            });
        });

        describe('comStatus()', () => {
            test('deve adicionar filtro de status quando valor é válido', () => {
                filterBuilder.comStatus('ativo');
                const resultado = filterBuilder.build();

                expect(resultado.status).toBe('ativo');
            });

            test('deve aceitar status em maiúscula e converter para minúscula', () => {
                filterBuilder.comStatus('INATIVO');
                const resultado = filterBuilder.build();

                expect(resultado.status).toBe('inativo');
            });

            test('não deve adicionar filtro de status quando valor é inválido', () => {
                filterBuilder.comStatus('invalido');
                const resultado = filterBuilder.build();

                expect(resultado).not.toHaveProperty('status');
            });

            test('deve aceitar todos os status válidos', () => {
                const statusValidos = ['ativo', 'inativo', 'rascunho', 'arquivado'];

                statusValidos.forEach(status => {
                    const fb = new CursoFilterBuilder();
                    fb.comStatus(status);
                    const resultado = fb.build();
                    expect(resultado.status).toBe(status);
                });
            });
        });

        describe('apenasAtivos()', () => {
            test('deve funcionar para compatibilidade com dados antigos', () => {
                filterBuilder.apenasAtivos();
                const resultado = filterBuilder.build();



                expect(resultado).toHaveProperty('$or');
                expect(resultado.$or).toContainEqual({
                    status: 'ativo'
                });
                expect(resultado.$or).toContainEqual({
                    status: {
                        $exists: false
                    }
                });
                expect(resultado.$or).toContainEqual({
                    status: null
                });
            });
        });

        describe('comQuantidadeAulas()', () => {
            test('deve adicionar filtro de quantidade mínima de aulas', () => {
                filterBuilder.comQuantidadeAulas(5);
                const resultado = filterBuilder.build();

                expect(resultado.especiais.quantidadeAulas).toHaveProperty('min', 5);
            });

            test('deve adicionar filtro de quantidade máxima de aulas', () => {
                filterBuilder.comQuantidadeAulas(null, 20);
                const resultado = filterBuilder.build();

                expect(resultado.especiais.quantidadeAulas).toHaveProperty('max', 20);
            });

            test('deve adicionar filtro de faixa de quantidade de aulas', () => {
                filterBuilder.comQuantidadeAulas(5, 20);
                const resultado = filterBuilder.build();

                expect(resultado.especiais.quantidadeAulas).toHaveProperty('min', 5);
                expect(resultado.especiais.quantidadeAulas).toHaveProperty('max', 20);
            });

            test('não deve adicionar filtro quando valores são inválidos', () => {
                filterBuilder.comQuantidadeAulas('abc', 'def');
                const resultado = filterBuilder.build();

                expect(resultado).not.toHaveProperty('_quantidadeAulas');
            });
        });

        describe('ordenarPor()', () => {
            test('deve adicionar ordenação por campo válido em ordem crescente', () => {
                filterBuilder.ordenarPor('titulo');
                const resultado = filterBuilder.build();

                expect(resultado.especiais.sort).toEqual({
                    titulo: 1
                });
            });

            test('deve adicionar ordenação em ordem decrescente', () => {
                filterBuilder.ordenarPor('createdAt', 'desc');
                const resultado = filterBuilder.build();

                expect(resultado.especiais.sort).toEqual({
                    createdAt: -1
                });
            });

            test('deve aceitar todos os campos válidos', () => {
                const camposValidos = ['titulo', 'createdAt', 'updatedAt', 'cargaHorariaTotal', 'status'];

                camposValidos.forEach(campo => {
                    const fb = new CursoFilterBuilder();
                    fb.ordenarPor(campo);
                    const resultado = fb.build();
                    expect(resultado.especiais.sort).toEqual({
                        [campo]: 1
                    });
                });
            });

            test('não deve adicionar ordenação para campo inválido', () => {
                filterBuilder.ordenarPor('campoInvalido');
                const resultado = filterBuilder.build();

                expect(resultado).not.toHaveProperty('_sort');
            });
        });

        describe('build() - Estrutura atualizada', () => {
            test('deve retornar objeto com filtros e especiais quando há filtros especiais', () => {
                filterBuilder
                    .comTitulo('JavaScript')
                    .comStatus('ativo')
                    .comQuantidadeAulas(5, 20)
                    .ordenarPor('titulo', 'asc');

                const resultado = filterBuilder.build();

                expect(resultado).toHaveProperty('filtros');
                expect(resultado).toHaveProperty('especiais');
                expect(resultado.filtros.titulo).toHaveProperty('$regex', 'JavaScript');
                expect(resultado.filtros.status).toBe('ativo');
                expect(resultado.especiais.quantidadeAulas).toEqual({
                    min: 5,
                    max: 20
                });
                expect(resultado.especiais.sort).toEqual({
                    titulo: 1
                });
            });

            test('deve retornar compatibilidade com versão antiga quando não há filtros especiais', () => {
                filterBuilder.comTitulo('JavaScript');
                const resultado = filterBuilder.build();


                expect(resultado).toHaveProperty('titulo');
                expect(resultado.titulo).toHaveProperty('$regex', 'JavaScript');
                expect(resultado).not.toHaveProperty('filtros');
                expect(resultado).not.toHaveProperty('especiais');
            });
        });
    });

    describe('Testes de branches e casos edge adicionais', () => {
        test('deve lidar com valores 0 em filtros numéricos', () => {
            filterBuilder
                .comCargaHorariaMin(0)
                .comCargaHorariaMax(0);

            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('cargaHorariaTotal');
            expect(filtro.cargaHorariaTotal).toHaveProperty('$gte', 0);
            expect(filtro.cargaHorariaTotal).toHaveProperty('$lte', 0);
        });

        test('deve lidar com valores falsy em strings', () => {
            filterBuilder
                .comTitulo(false)
                .comDescricao(0)
                .comTags(null)
                .comProfessores(undefined);

            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).not.toHaveProperty('titulo');
            expect(filtro).not.toHaveProperty('descricao');
            expect(filtro).not.toHaveProperty('tags');
            expect(filtro).not.toHaveProperty('professores');
        });

        test('deve tratar strings vazias e com apenas espaços', () => {
            filterBuilder
                .comTitulo('  ')
                .comDescricao('\t\n')
                .comTags('    ')
                .comProfessores('');

            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toEqual({});
        });

        test('deve lidar com ObjectId inválidos', () => {
            filterBuilder
                .criadoPor('id-inválido')
                .comId('outro-id-inválido');

            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);


            expect(filtro).toHaveProperty('criadoPorId', 'id-inválido');
            expect(filtro).toHaveProperty('_id', 'outro-id-inválido');
        });

        test('deve lidar com ObjectIds válidos', () => {
            const objectId1 = new mongoose.Types.ObjectId();
            const objectId2 = new mongoose.Types.ObjectId();

            filterBuilder
                .criadoPor(objectId1)
                .comId(objectId2);

            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('criadoPorId', objectId1);
            expect(filtro).toHaveProperty('_id', objectId2);
        });

        test('deve testar conversão de temMaterialComplementar com diferentes tipos', () => {

            filterBuilder.comMaterialComplementar(true);
            let resultado = filterBuilder.build();
            let filtro = extrairFiltros(resultado);
            expect(filtro).toHaveProperty('materialComplementar');
            expect(filtro.materialComplementar).toHaveProperty('$exists', true);
            expect(filtro.materialComplementar).toHaveProperty('$not');


            filterBuilder.reset();
            filterBuilder.comMaterialComplementar(false);
            resultado = filterBuilder.build();
            filtro = extrairFiltros(resultado);
            expect(filtro).toHaveProperty('$or');


            filterBuilder.reset();
            filterBuilder.comMaterialComplementar('true');
            resultado = filterBuilder.build();
            filtro = extrairFiltros(resultado);
            expect(filtro).toHaveProperty('materialComplementar');

            filterBuilder.reset();
            filterBuilder.comMaterialComplementar('false');
            resultado = filterBuilder.build();
            filtro = extrairFiltros(resultado);
            expect(filtro).toHaveProperty('$or');

            filterBuilder.reset();
            filterBuilder.comMaterialComplementar('maybe');
            resultado = filterBuilder.build();
            filtro = extrairFiltros(resultado);
            expect(filtro).toEqual({});
        });

        test('deve lidar com datas inválidas', () => {
            filterBuilder
                .comDataInicio('data-invalida')
                .comDataFim('outra-data-invalida');

            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toEqual({});
        });

        test('deve testar todas as combinações de status', () => {
            const statusValidos = ['ativo', 'inativo', 'arquivado', 'rascunho'];

            statusValidos.forEach(status => {
                filterBuilder.reset();
                filterBuilder.comStatus(status);
                const resultado = filterBuilder.build();
                const filtro = extrairFiltros(resultado);
                expect(filtro).toHaveProperty('status', status);
            });

            filterBuilder.reset();
            filterBuilder.comStatus('status-invalido');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('status');
        });

        test('deve aplicar filtro padrão de status ativo', () => {
            const resultado = filterBuilder.aplicarFiltroPadrao().build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('status', 'ativo');
        });

        test('deve resetar corretamente todos os filtros', () => {
            filterBuilder
                .comTitulo('JavaScript')
                .comDescricao('Curso completo')
                .comTags('programacao')
                .comProfessores('João Silva')
                .comCargaHorariaMin(10)
                .comCargaHorariaMax(50)
                .comDataInicio('2024-01-01')
                .comDataFim('2024-12-31')
                .comStatus('ativo')
                .comMaterialComplementar(true)
                .criadoPor('507f1f77bcf86cd799439011')
                .comId('507f1f77bcf86cd799439012');

            let resultado = filterBuilder.build();
            let filtro = extrairFiltros(resultado);
            expect(Object.keys(filtro).length).toBeGreaterThan(0);

            filterBuilder.reset();
            resultado = filterBuilder.build();
            filtro = extrairFiltros(resultado);
            expect(filtro).toEqual({});
        });

        test('deve permitir method chaining em todas as operações', () => {
            const objectId = new mongoose.Types.ObjectId();

            const resultado = filterBuilder
                .comTitulo('JavaScript')
                .comDescricao('Curso')
                .comTags('tag')
                .comProfessores('professor')
                .comCargaHorariaMin(10)
                .comCargaHorariaMax(50)
                .comDataInicio('2024-01-01T00:00:00.000Z')
                .comDataFim('2024-12-31T23:59:59.999Z')
                .comStatus('ativo')
                .comMaterialComplementar(true)
                .criadoPor(objectId)
                .comId(objectId)
                .aplicarFiltroPadrao()
                .reset()
                .comTitulo('Novo Título')
                .build();

            const filtro = extrairFiltros(resultado);
            expect(filtro).toHaveProperty('titulo');
            expect(filtro.titulo).toHaveProperty('$regex', 'Novo Título');
        });

        test('deve lidar com encadeamento de métodos mesmo com valores inválidos', () => {
            const resultado = filterBuilder
                .comTitulo('')
                .comDescricao(null)
                .comTags(undefined)
                .comProfessores(false)
                .comCargaHorariaMin(-1)
                .comCargaHorariaMax(-1)
                .comDataInicio('invalid')
                .comDataFim(123)
                .comStatus('invalid')
                .comMaterialComplementar('maybe')
                .criadoPor('')
                .comId(null)
                .build();

            const filtro = extrairFiltros(resultado);
            expect(filtro).toEqual({});
        });

        test('deve manter estado isolado entre instâncias', () => {
            const builder1 = new CursoFilterBuilder();
            const builder2 = new CursoFilterBuilder();

            builder1.comTitulo('Builder 1');
            builder2.comTitulo('Builder 2');

            const resultado1 = builder1.build();
            const resultado2 = builder2.build();

            const filtro1 = extrairFiltros(resultado1);
            const filtro2 = extrairFiltros(resultado2);

            expect(filtro1.titulo.$regex).toBe('Builder 1');
            expect(filtro2.titulo.$regex).toBe('Builder 2');
        });
    });
});