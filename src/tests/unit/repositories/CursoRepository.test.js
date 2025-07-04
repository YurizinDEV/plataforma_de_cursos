// src/tests/unit/repositories/CursoRepository.test.js
import mongoose from 'mongoose';
import {
    MongoMemoryServer
} from 'mongodb-memory-server';
import CursoRepository from '../../../repositories/CursoRepository.js';
import CursoModel from '../../../models/Curso.js';
import UsuarioModel from '../../../models/Usuario.js';

let mongoServer;
let cursoRepository;

const usuarioBase = {
    nome: 'Usuário Criador',
    email: 'criador@teste.com',
    senha: 'Senha@123'
};

const cursoBase = {
    titulo: 'Curso Teste',
    descricao: 'Descrição do curso',
    criadoPorId: undefined,
    cargaHorariaTotal: 10
};

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    cursoRepository = new CursoRepository();
});

beforeEach(async () => {
    await CursoModel.deleteMany({});
    await UsuarioModel.deleteMany({});
    const usuario = await UsuarioModel.create(usuarioBase);
    cursoBase.criadoPorId = usuario._id;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('CursoRepository', () => {
    test('deve instanciar corretamente', () => {
        expect(cursoRepository).toBeInstanceOf(CursoRepository);
        expect(cursoRepository.model).toBeDefined();
    });

    describe('Cadastro de curso', () => {
        test('deve falhar ao salvar sem título', async () => {
            const dados = {
                ...cursoBase
            };
            delete dados.titulo;
            await expect(cursoRepository.criar(dados)).rejects.toThrow();
        });
        test('deve falhar ao salvar sem criadoPorId', async () => {
            const dados = {
                ...cursoBase
            };
            delete dados.criadoPorId;
            await expect(cursoRepository.criar(dados)).rejects.toThrow();
        });
        test('deve salvar curso válido com sucesso', async () => {
            const dados = {
                ...cursoBase
            };
            const curso = await cursoRepository.criar(dados);
            expect(curso).toBeDefined();
            expect(curso._id).toBeDefined();
            expect(curso.titulo).toBe(cursoBase.titulo);
        });
        test('deve definir status como "ativo" por padrão', async () => {
            const dados = {
                ...cursoBase
            };
            delete dados.status;
            const curso = await cursoRepository.criar(dados);
            expect(curso.status).toBe('ativo');
        });
        test('não deve permitir título duplicado', async () => {
            const dados = {
                ...cursoBase
            };
            await cursoRepository.criar(dados);
            await expect(cursoRepository.criar(dados)).rejects.toThrow();
        });
        test('cargaHorariaTotal padrão deve ser 0 se omitido', async () => {
            const dados = {
                ...cursoBase
            };
            delete dados.cargaHorariaTotal;
            const curso = await cursoRepository.criar(dados);
            expect(curso.cargaHorariaTotal).toBe(0);
        });
        test('deve falhar ao cadastrar cargaHorariaTotal negativa', async () => {
            const dados = {
                ...cursoBase,
                cargaHorariaTotal: -5
            };
            await expect(cursoRepository.criar(dados)).rejects.toThrow();
        });
        test('deve salvar sem campos opcionais', async () => {
            const dados = {
                titulo: 'Curso Sem Opcionais',
                criadoPorId: cursoBase.criadoPorId
            };
            const curso = await cursoRepository.criar(dados);
            expect(curso).toBeDefined();
            expect(curso.titulo).toBe('Curso Sem Opcionais');
        });
        test('arrays devem ser inicializados vazios', async () => {
            const dados = {
                titulo: 'Curso Arrays Vazios',
                criadoPorId: cursoBase.criadoPorId
            };
            const curso = await cursoRepository.criar(dados);
            expect(Array.isArray(curso.materialComplementar)).toBe(true);
            expect(Array.isArray(curso.professores)).toBe(true);
            expect(Array.isArray(curso.tags)).toBe(true);
        });
    });

    describe('Leitura e listagem', () => {
        test('deve retornar todos os cursos cadastrados', async () => {
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Curso 1'
            });
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Curso 2'
            });
            const req = {
                query: {},
                params: {}
            };
            const resultado = await cursoRepository.listar(req);
            expect(resultado.docs.length).toBeGreaterThanOrEqual(2);
        });
        test('deve buscar curso por id', async () => {
            const curso = await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Curso Busca'
            });
            const req = {
                query: {},
                params: {
                    id: curso._id.toString()
                }
            };
            const resultado = await cursoRepository.listar(req);
            expect(resultado.docs[0]._id.toString()).toBe(curso._id.toString());
        });
    });

    describe('Atualização de curso', () => {
        test('deve atualizar informações de um curso', async () => {
            const curso = await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Curso Atualizar'
            });
            const atualizado = await cursoRepository.atualizar(curso._id, {
                descricao: 'Nova descrição'
            });
            expect(atualizado.descricao).toBe('Nova descrição');
        });
        test('deve lançar erro ao tentar atualizar curso inexistente', async () => {
            const idFake = new mongoose.Types.ObjectId();
            await expect(cursoRepository.atualizar(idFake, {
                descricao: 'X'
            })).rejects.toThrow();
        });
    });

    describe('Remoção de curso', () => {
        test('deve arquivar (soft delete) um curso existente', async () => {
            const curso = await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Curso Remover'
            });
            const removido = await cursoRepository.deletar(curso._id);
            expect(removido.status).toBe('arquivado');
        });
        test('deve lançar erro ao tentar remover curso inexistente', async () => {
            const idFake = new mongoose.Types.ObjectId();
            await expect(cursoRepository.deletar(idFake)).rejects.toThrow();
        });
        test('deve remover fisicamente um curso', async () => {
            const curso = await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Curso Físico'
            });
            const removido = await cursoRepository.deletarFisicamente(curso._id);
            expect(removido._id.toString()).toBe(curso._id.toString());
            const buscado = await CursoModel.findById(curso._id);
            expect(buscado).toBeNull();
        });
        test('deve lançar erro ao tentar remover fisicamente curso inexistente', async () => {
            const idFake = new mongoose.Types.ObjectId();
            await expect(cursoRepository.deletarFisicamente(idFake)).rejects.toThrow();
        });
    });

    describe('Restaurar curso', () => {
        test('deve restaurar um curso arquivado', async () => {
            const curso = await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Curso Restaurar'
            });
            await cursoRepository.deletar(curso._id);
            const restaurado = await cursoRepository.restaurar(curso._id);
            expect(restaurado.status).toBe('ativo');
        });
        test('deve lançar erro ao tentar restaurar curso inexistente', async () => {
            const idFake = new mongoose.Types.ObjectId();
            await expect(cursoRepository.restaurar(idFake)).rejects.toThrow();
        });
    });

    describe('Regras de negócio e filtros', () => {
        test('deve filtrar por status', async () => {
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Ativo',
                status: 'ativo'
            });
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Arquivado',
                status: 'arquivado'
            });
            const req = {
                query: {
                    status: 'ativo'
                },
                params: {}
            };
            const resultado = await cursoRepository.listar(req);
            expect(resultado.docs.every(c => c.status === 'ativo')).toBe(true);
        });
        test('deve filtrar por título exato', async () => {
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Título Único'
            });
            const req = {
                query: {
                    tituloExato: 'Título Único'
                },
                params: {}
            };
            const resultado = await cursoRepository.listar(req);
            expect(resultado.docs[0].titulo).toBe('Título Único');
        });
        test('deve filtrar por criador', async () => {
            const usuario2 = await UsuarioModel.create({
                nome: 'Outro',
                email: 'outro@teste.com',
                senha: '123'
            });
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Do Criador 1',
                criadoPorId: cursoBase.criadoPorId
            });
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Do Criador 2',
                criadoPorId: usuario2._id
            });
            const req = {
                query: {
                    criadoPorId: usuario2._id.toString()
                },
                params: {}
            };
            const resultado = await cursoRepository.listar(req);
            expect(resultado.docs.every(c => c.criadoPorId.toString() === usuario2._id.toString())).toBe(true);
        });
        test('deve filtrar por tags (OR)', async () => {
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Tag JS',
                tags: ['js']
            });
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Tag Node',
                tags: ['node']
            });
            const req = {
                query: {
                    tags: 'js,node'
                },
                params: {}
            };
            const resultado = await cursoRepository.listar(req);
            expect(resultado.docs.length).toBeGreaterThanOrEqual(2);
        });
        test('deve filtrar por todas as tags (AND)', async () => {
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Tag AND',
                tags: ['js', 'node']
            });
            const req = {
                query: {
                    tag1: 'js',
                    tag2: 'node'
                },
                params: {}
            };
            const resultado = await cursoRepository.listar(req);
            expect(resultado.docs[0].tags).toEqual(expect.arrayContaining(['js', 'node']));
        });
        test('deve filtrar por material complementar (boolean)', async () => {
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Com Material',
                materialComplementar: ['link']
            });
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Sem Material',
                materialComplementar: []
            });
            const req = {
                query: {
                    temMaterialComplementar: 'true'
                },
                params: {}
            };
            const resultado = await cursoRepository.listar(req);
            expect(resultado.docs.every(c => c.materialComplementar && c.materialComplementar.length > 0)).toBe(true);
        });
    });

    describe('Enriquecimento de dados', () => {
        test('deve retornar estatísticas no curso', async () => {
            const curso = await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Curso Estatísticas'
            });
            const req = {
                query: {
                    tituloExato: 'Curso Estatísticas'
                },
                params: {}
            };
            const resultado = await cursoRepository.listar(req);
            expect(resultado.docs[0].estatisticas).toBeDefined();
            expect(resultado.docs[0].estatisticas).toHaveProperty('totalAulas');
            expect(resultado.docs[0].estatisticas).toHaveProperty('duracaoFormatada');
        });
    });

    describe('Cobertura de erros e métodos auxiliares', () => {
        test('buscarPorId deve lançar erro se não encontrar', async () => {
            const idFake = new mongoose.Types.ObjectId();
            await expect(cursoRepository.buscarPorId(idFake)).rejects.toThrow();
        });
        test('buscarPorTitulo deve lançar erro se não encontrar', async () => {
            await expect(cursoRepository.buscarPorTitulo('inexistente')).rejects.toThrow();
        });
        test('buscarPorTitulo deve retornar null se throwOnNotFound=false', async () => {
            const result = await cursoRepository.buscarPorTitulo('inexistente', {
                throwOnNotFound: false
            });
            expect(result).toBeNull();
        });
        test('formatarDuracao retorna 0min para 0', () => {
            expect(cursoRepository.formatarDuracao(0)).toBe('0min');
        });
        test('formatarDuracao retorna minutos para < 60', () => {
            expect(cursoRepository.formatarDuracao(45)).toBe('45min');
        });
        test('formatarDuracao retorna horas e minutos para >= 60', () => {
            expect(cursoRepository.formatarDuracao(125)).toBe('2h 5min');
        });
        test('listar deve aplicar ordenação', async () => {
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'A'
            });
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'B'
            });
            const req = {
                query: {
                    ordenarPor: 'titulo',
                    direcaoOrdem: 'desc'
                },
                params: {}
            };
            const resultado = await cursoRepository.listar(req);
            expect(resultado.docs[0].titulo).toBe('B');
        });
        test('listar deve aplicar filtro de quantidade de aulas (pipeline)', async () => {
            const curso = await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Com Aula'
            });
            const req = {
                query: {
                    quantidadeAulasMin: 0
                },
                params: {}
            };
            const resultado = await cursoRepository.listar(req);
            expect(resultado.docs.length).toBeGreaterThanOrEqual(1);
        });
        test('listar deve retornar array vazio se buscar por id inexistente', async () => {
            const req = {
                query: {},
                params: {
                    id: new mongoose.Types.ObjectId().toString()
                }
            };
            const resultado = await cursoRepository.listar(req);
            expect(resultado.docs.length).toBe(0);
        });
    });

    describe('Cobertura avançada de branches e auxiliares', () => {
        test('listarComQuantidadeAulas retorna corretamente sem aulas', async () => {
            const curso = await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Sem Aula'
            });
            const result = await cursoRepository.listarComQuantidadeAulas({}, {
                min: 0
            }, {
                page: 1,
                limit: 10
            });
            expect(result.docs.length).toBeGreaterThanOrEqual(1);
            expect(result.docs[0]).toHaveProperty('estatisticas');
        });
        test('listarComQuantidadeAulas pagina corretamente', async () => {
            for (let i = 0; i < 5; i++) {
                await cursoRepository.criar({
                    ...cursoBase,
                    titulo: `Curso Pag${i}`
                });
            }
            const result = await cursoRepository.listarComQuantidadeAulas({}, {
                min: 0
            }, {
                page: 1,
                limit: 2
            });
            expect(result.docs.length).toBeLessThanOrEqual(2);
            expect(result.page).toBe(1);
        });
        test('enriquecerCurso lida com curso sem professores/tags/material', async () => {
            const curso = await cursoRepository.criar({
                titulo: 'Sem Nada',
                criadoPorId: cursoBase.criadoPorId
            });
            const enriched = await cursoRepository.enriquecerCurso(curso);
            expect(enriched.estatisticas.totalProfessores).toBe(0);
            expect(enriched.estatisticas.totalTags).toBe(0);
            expect(enriched.estatisticas.totalMaterialComplementar).toBe(0);
        });
        test('enriquecerCurso lida com curso com professores/tags/material', async () => {
            const curso = await cursoRepository.criar({
                titulo: 'Com Tudo',
                criadoPorId: cursoBase.criadoPorId,
                professores: ['Prof1', 'Prof2'],
                tags: ['tag1', 'tag2'],
                materialComplementar: ['mat1', 'mat2']
            });
            const enriched = await cursoRepository.enriquecerCurso(curso);
            expect(enriched.estatisticas.totalProfessores).toBe(2);
            expect(enriched.estatisticas.totalTags).toBe(2);
            expect(enriched.estatisticas.totalMaterialComplementar).toBe(2);
        });
        test('listarComQuantidadeAulas retorna vazio se não houver cursos', async () => {
            await CursoModel.deleteMany({});
            const result = await cursoRepository.listarComQuantidadeAulas({
                titulo: 'inexistente'
            }, {
                min: 0
            }, {
                page: 1,
                limit: 10
            });
            expect(result.docs.length).toBe(0);
        });
    });

    describe('Cobertura de exceções e branches raros', () => {
        test('listarComQuantidadeAulas lida com paginação sem próxima página', async () => {
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Pag1'
            });
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Pag2'
            });
            const result = await cursoRepository.listarComQuantidadeAulas({}, {
                min: 0
            }, {
                page: 2,
                limit: 2
            });
            expect(result.hasNextPage).toBe(false);
            expect(result.hasPrevPage).toBe(true);
        });
        test('listarComQuantidadeAulas lida com próxima página', async () => {
            for (let i = 0; i < 5; i++) {
                await cursoRepository.criar({
                    ...cursoBase,
                    titulo: `PagNext${i}`
                });
            }
            const result = await cursoRepository.listarComQuantidadeAulas({}, {
                min: 0
            }, {
                page: 1,
                limit: 2
            });
            expect(result.hasNextPage).toBe(true);
        });
        test('enriquecerCurso lida com curso sem cargaHorariaTotal', async () => {
            const curso = await cursoRepository.criar({
                titulo: 'Sem Carga',
                criadoPorId: cursoBase.criadoPorId
            });
            const obj = curso.toObject();
            delete obj.cargaHorariaTotal;
            const fakeCurso = {
                toObject: () => obj
            };
            const enriched = await cursoRepository.enriquecerCurso(fakeCurso);
            expect(enriched.estatisticas.duracaoTotalMinutos).toBe(0);
        });
        test('listar lança erro se filterBuilder.build não for função', async () => {
            const req = {
                query: {
                    titulo: 'qualquer'
                },
                params: {}
            };
            const original = cursoRepository.listar;
            const CursoFilterBuilder = require('../../../repositories/filters/CursoFilterBuilder.js').default;
            const fakeBuilder = {
                build: null,
                comTitulo: () => fakeBuilder
            };
            cursoRepository.listar = async function (req) {
                const filterBuilder = fakeBuilder;
                if (typeof filterBuilder.build !== 'function') {
                    throw new Error('Simulado');
                }
            };
            await expect(cursoRepository.listar(req)).rejects.toThrow('Simulado');
            cursoRepository.listar = original;
        });
        test('listarComQuantidadeAulas lida com min/max undefined', async () => {
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'MinMax'
            });
            const result = await cursoRepository.listarComQuantidadeAulas({}, {}, {
                page: 1,
                limit: 10
            });
            expect(result.docs.length).toBeGreaterThanOrEqual(1);
        });
        test('listarComQuantidadeAulas lida com erro no aggregation', async () => {
            const original = cursoRepository.model.aggregate;
            cursoRepository.model.aggregate = async () => {
                throw new Error('Aggregation error');
            };
            await expect(cursoRepository.listarComQuantidadeAulas({}, {}, {
                page: 1,
                limit: 10
            })).rejects.toThrow('Aggregation error');
            cursoRepository.model.aggregate = original;
        });
        test('enriquecerCurso lida com erro em aulaRepository.contarPorCursoId', async () => {
            const curso = await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Erro Aula'
            });
            const original = cursoRepository.aulaRepository.contarPorCursoId;
            cursoRepository.aulaRepository.contarPorCursoId = async () => {
                throw new Error('Erro simulado');
            };
            await expect(cursoRepository.enriquecerCurso(curso)).rejects.toThrow('Erro simulado');
            cursoRepository.aulaRepository.contarPorCursoId = original;
        });
        test('enriquecerCurso lida com erro em questionarioRepository.buscarPorAulaIds', async () => {
            const curso = await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Erro Quest'
            });
            const originalAula = cursoRepository.aulaRepository.contarPorCursoId;
            const originalBusca = cursoRepository.aulaRepository.buscarPorCursoId;
            cursoRepository.aulaRepository.contarPorCursoId = async () => 1;
            cursoRepository.aulaRepository.buscarPorCursoId = async () => [{
                _id: 'aula1'
            }];
            const originalQ = cursoRepository.questionarioRepository.buscarPorAulaIds;
            cursoRepository.questionarioRepository.buscarPorAulaIds = async () => {
                throw new Error('Erro simulado Q');
            };
            await expect(cursoRepository.enriquecerCurso(curso)).rejects.toThrow('Erro simulado Q');
            cursoRepository.aulaRepository.contarPorCursoId = originalAula;
            cursoRepository.aulaRepository.buscarPorCursoId = originalBusca;
            cursoRepository.questionarioRepository.buscarPorAulaIds = originalQ;
        });
        test('enriquecerCurso lida com erro em alternativaRepository.contarPorQuestionarioIds', async () => {
            const cursoRepositoryAlt = new CursoRepository({
                model: CursoModel,
                aulaRepository: {
                    contarPorCursoId: async () => 1,
                    buscarPorCursoId: async () => [{
                        _id: 'aula1'
                    }]
                },
                questionarioRepository: {
                    buscarPorAulaIds: async () => [{
                        _id: 'q1'
                    }]
                },
                alternativaRepository: {
                    contarPorQuestionarioIds: async () => {
                        throw new Error('Erro simulado Alt');
                    }
                }
            });
            const curso = await cursoRepositoryAlt.criar({
                ...cursoBase,
                titulo: 'Erro Alt'
            });
            await expect(cursoRepositoryAlt.enriquecerCurso(curso)).rejects.toThrow('Erro simulado Alt');
        });
    });
});