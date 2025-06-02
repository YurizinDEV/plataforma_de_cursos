// src/tests/unit/repositories/CursoRepository.test.js
import mongoose from 'mongoose';
import {
    MongoMemoryServer
} from 'mongodb-memory-server';
import CursoRepository from '../../../repositories/CursoRepository.js';
import CursoModel from '../../../models/Curso.js';
import {
    CustomError
} from '../../../utils/helpers/index.js';

let mongoServer;
let cursoRepository;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    await mongoose.connection.collection('cursos').createIndex({
        titulo: 1
    }, {
        unique: true
    });

    cursoRepository = new CursoRepository();
});

beforeEach(async () => {
    await CursoModel.deleteMany({});
    jest.clearAllMocks();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

const cursoBase = {
    titulo: 'Curso Teste',
    descricao: 'Descrição do curso teste',
    cargaHorariaTotal: 20,
    criadoPorId: new mongoose.Types.ObjectId()
};

describe('CursoRepository', () => {
    describe('criar()', () => {
        test('deve criar um curso com sucesso', async () => {
            const resultado = await cursoRepository.criar(cursoBase);

            expect(resultado).toHaveProperty('_id');
            expect(resultado.titulo).toBe(cursoBase.titulo);
            expect(resultado.descricao).toBe(cursoBase.descricao);
            expect(resultado.cargaHorariaTotal).toBe(cursoBase.cargaHorariaTotal);
        });

        test('deve rejeitar ao criar curso com título duplicado', async () => {
            await cursoRepository.criar(cursoBase);

            await expect(cursoRepository.criar({
                ...cursoBase,
                descricao: 'Outro curso com mesmo título'
            })).rejects.toThrow();
        });

        test('deve criar curso sem campos opcionais', async () => {
            const cursoMinimo = {
                titulo: 'Curso Mínimo',
                criadoPorId: new mongoose.Types.ObjectId()
            };

            const resultado = await cursoRepository.criar(cursoMinimo);

            expect(resultado).toHaveProperty('_id');
            expect(resultado.titulo).toBe(cursoMinimo.titulo);
            expect(resultado.cargaHorariaTotal).toBe(0); // Valor padrão
        });
    });

    describe('buscarPorId()', () => {
        test('deve buscar curso por ID com sucesso', async () => {
            const cursoCriado = await cursoRepository.criar(cursoBase);

            const resultado = await cursoRepository.buscarPorId(cursoCriado._id);

            expect(resultado).toHaveProperty('_id');
            expect(resultado._id.toString()).toBe(cursoCriado._id.toString());
            expect(resultado.titulo).toBe(cursoBase.titulo);
        });

        test('deve lançar erro ao buscar curso com ID inexistente', async () => {
            const idInexistente = new mongoose.Types.ObjectId();

            await expect(cursoRepository.buscarPorId(idInexistente)).rejects.toThrow(CustomError);
            await expect(cursoRepository.buscarPorId(idInexistente)).rejects.toThrow(/não encontrado/);
        });
    });

    describe('buscarPorTitulo()', () => {
        test('deve buscar curso por título com sucesso', async () => {
            await cursoRepository.criar(cursoBase);

            const resultado = await cursoRepository.buscarPorTitulo(cursoBase.titulo);

            expect(resultado).toHaveProperty('_id');
            expect(resultado.titulo).toBe(cursoBase.titulo);
        });

        test('deve lançar erro ao buscar curso com título inexistente', async () => {
            const tituloInexistente = 'Curso Inexistente';

            await expect(cursoRepository.buscarPorTitulo(tituloInexistente)).rejects.toThrow(CustomError);
            await expect(cursoRepository.buscarPorTitulo(tituloInexistente)).rejects.toThrow(/não encontrado/);
        });

        test('não deve lançar erro se throwOnNotFound for false', async () => {
            const tituloInexistente = 'Curso Inexistente';

            const resultado = await cursoRepository.buscarPorTitulo(tituloInexistente, {
                throwOnNotFound: false
            });
            expect(resultado).toBeNull();
        });
    });

    describe('atualizar()', () => {
        test('deve atualizar curso com sucesso', async () => {
            const cursoCriado = await cursoRepository.criar(cursoBase);

            const dadosAtualizados = {
                titulo: 'Curso Atualizado',
                cargaHorariaTotal: 30
            };

            const resultado = await cursoRepository.atualizar(cursoCriado._id, dadosAtualizados);

            expect(resultado).toHaveProperty('_id');
            expect(resultado._id.toString()).toBe(cursoCriado._id.toString());
            expect(resultado.titulo).toBe(dadosAtualizados.titulo);
            expect(resultado.cargaHorariaTotal).toBe(dadosAtualizados.cargaHorariaTotal);
            expect(resultado.descricao).toBe(cursoBase.descricao); // Campo não modificado
        });

        test('deve lançar erro ao atualizar curso inexistente', async () => {
            const idInexistente = new mongoose.Types.ObjectId();

            const dadosAtualizados = {
                titulo: 'Curso Atualizado',
                cargaHorariaTotal: 30
            };

            await expect(cursoRepository.atualizar(idInexistente, dadosAtualizados)).rejects.toThrow(CustomError);
            await expect(cursoRepository.atualizar(idInexistente, dadosAtualizados)).rejects.toThrow(/não encontrado/);
        });
    });

    describe('deletar()', () => {
        test('deve deletar curso com sucesso', async () => {
            const cursoCriado = await cursoRepository.criar(cursoBase);

            const resultado = await cursoRepository.deletar(cursoCriado._id);

            expect(resultado).toHaveProperty('_id');
            expect(resultado._id.toString()).toBe(cursoCriado._id.toString());

            await expect(cursoRepository.buscarPorId(cursoCriado._id)).rejects.toThrow(CustomError);
        });

        test('deve lançar erro ao deletar curso inexistente', async () => {
            const idInexistente = new mongoose.Types.ObjectId();

            await expect(cursoRepository.deletar(idInexistente)).rejects.toThrow(CustomError);
            await expect(cursoRepository.deletar(idInexistente)).rejects.toThrow(/não encontrado/);
        });
    });

    describe('listar()', () => {
        beforeEach(async () => {
            // Criar alguns cursos para testar a listagem
            await cursoRepository.criar({
                titulo: 'Curso de JavaScript',
                descricao: 'Aprenda JavaScript do zero',
                cargaHorariaTotal: 30,
                tags: ['javascript', 'web'],
                professores: ['Ana Silva'],
                criadoPorId: new mongoose.Types.ObjectId()
            });

            await cursoRepository.criar({
                titulo: 'Curso de Node.js',
                descricao: 'Desenvolvimento backend com Node.js',
                cargaHorariaTotal: 40,
                tags: ['javascript', 'node', 'backend'],
                professores: ['João Santos', 'Carlos Oliveira'],
                criadoPorId: new mongoose.Types.ObjectId()
            });

            await cursoRepository.criar({
                titulo: 'Curso de React',
                descricao: 'Aprenda React e hooks',
                cargaHorariaTotal: 25,
                tags: ['javascript', 'react', 'frontend'],
                professores: ['João Santos'],
                criadoPorId: new mongoose.Types.ObjectId()
            });
        });

        test('deve listar todos os cursos', async () => {
            const req = {
                query: {}
            };

            const resultado = await cursoRepository.listar(req);

            expect(resultado).toHaveProperty('docs');
            expect(resultado.docs).toHaveLength(3);
            expect(resultado).toHaveProperty('totalDocs', 3);
        });

        test('deve buscar curso específico por ID', async () => {
            const cursoCriado = await cursoRepository.criar({
                titulo: 'Curso Específico',
                criadoPorId: new mongoose.Types.ObjectId()
            });

            const req = {
                params: {
                    id: cursoCriado._id.toString()
                }
            };

            const resultado = await cursoRepository.listar(req);

            expect(resultado).toHaveProperty('_id');
            expect(resultado._id.toString()).toBe(cursoCriado._id.toString());
            expect(resultado.titulo).toBe('Curso Específico');
            expect(resultado).toHaveProperty('estatisticas');
        });

        test('deve filtrar cursos por título', async () => {
            const req = {
                query: {
                    titulo: 'JavaScript'
                }
            };

            const resultado = await cursoRepository.listar(req);

            expect(resultado).toHaveProperty('docs');
            expect(resultado.docs).toHaveLength(1);
            expect(resultado.docs[0].titulo).toBe('Curso de JavaScript');
        });

        test('deve filtrar cursos por tags', async () => {
            const req = {
                query: {
                    tags: 'frontend'
                }
            };

            const resultado = await cursoRepository.listar(req);

            expect(resultado).toHaveProperty('docs');
            expect(resultado.docs).toHaveLength(1);
            expect(resultado.docs[0].titulo).toBe('Curso de React');
        });

        test('deve filtrar cursos por professor', async () => {
            const req = {
                query: {
                    professores: 'Carlos Oliveira'
                }
            };

            const resultado = await cursoRepository.listar(req);

            expect(resultado).toHaveProperty('docs');
            expect(resultado.docs).toHaveLength(1);
            expect(resultado.docs[0].titulo).toBe('Curso de Node.js');
        });

        test('deve filtrar cursos por faixa de carga horária', async () => {
            const req = {
                query: {
                    cargaHorariaMin: 30,
                    cargaHorariaMax: 35
                }
            };

            const resultado = await cursoRepository.listar(req);

            expect(resultado).toHaveProperty('docs');
            expect(resultado.docs).toHaveLength(1);
            expect(resultado.docs[0].titulo).toBe('Curso de JavaScript');
        });

        test('deve paginar resultados corretamente', async () => {
            const req = {
                query: {
                    page: 1,
                    limite: 2
                }
            };

            const resultado = await cursoRepository.listar(req);

            expect(resultado).toHaveProperty('docs');
            expect(resultado.docs).toHaveLength(2);
            expect(resultado).toHaveProperty('totalDocs', 3);
            expect(resultado).toHaveProperty('page', 1);
            expect(resultado).toHaveProperty('totalPages');
            expect(resultado.totalPages).toBeGreaterThanOrEqual(2);
        });

        test('deve lançar erro ao tentar buscar ID inexistente', async () => {
            const idInexistente = new mongoose.Types.ObjectId();
            const req = {
                params: {
                    id: idInexistente.toString()
                }
            };

            await expect(cursoRepository.listar(req)).rejects.toThrow(CustomError);
            await expect(cursoRepository.listar(req)).rejects.toThrow(/não encontrado/);
        });
    });

    describe('enriquecerCurso()', () => {
        test('deve adicionar estatísticas corretas ao curso', async () => {
            const curso = await cursoRepository.criar({
                titulo: 'Curso com Estatísticas',
                descricao: 'Descrição do curso',
                cargaHorariaTotal: 15,
                materialComplementar: ['https://material1.com', 'https://material2.com'],
                professores: ['Professor A', 'Professor B', 'Professor C'],
                tags: ['tag1', 'tag2', 'tag3', 'tag4'],
                criadoPorId: new mongoose.Types.ObjectId()
            });

            const cursoEnriquecido = cursoRepository.enriquecerCurso(curso);

            expect(cursoEnriquecido).toHaveProperty('estatisticas');
            expect(cursoEnriquecido.estatisticas).toHaveProperty('totalMaterialComplementar', 2);
            expect(cursoEnriquecido.estatisticas).toHaveProperty('totalProfessores', 3);
            expect(cursoEnriquecido.estatisticas).toHaveProperty('totalTags', 4);
        });

        test('deve lidar corretamente com arrays vazios', async () => {
            const curso = await cursoRepository.criar({
                titulo: 'Curso Sem Extras',
                criadoPorId: new mongoose.Types.ObjectId()
            });

            const cursoEnriquecido = cursoRepository.enriquecerCurso(curso);

            expect(cursoEnriquecido).toHaveProperty('estatisticas');
            expect(cursoEnriquecido.estatisticas).toHaveProperty('totalMaterialComplementar', 0);
            expect(cursoEnriquecido.estatisticas).toHaveProperty('totalProfessores', 0);
            expect(cursoEnriquecido.estatisticas).toHaveProperty('totalTags', 0);
        });
    });
});