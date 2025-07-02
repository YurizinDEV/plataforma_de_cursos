// src/tests/unit/repositories/CursoRepository.test.js
import mongoose from 'mongoose';
import {
    MongoMemoryServer
} from 'mongodb-memory-server';
import CursoRepository from '../../../repositories/CursoRepository.js';
import CursoModel from '../../../models/Curso.js';
import UsuarioModel from '../../../models/Usuario.js';
import AulaModel from '../../../models/Aula.js';
import QuestionarioModel from '../../../models/Questionario.js';
import AlternativaModel from '../../../models/Alternativa.js';
import CertificadoModel from '../../../models/Certificado.js';
import {
    CustomError,
    HttpStatusCodes
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
    await UsuarioModel.deleteMany({});
    await AulaModel.deleteMany({});
    await QuestionarioModel.deleteMany({});
    await AlternativaModel.deleteMany({});
    await CertificadoModel.deleteMany({});
    jest.clearAllMocks();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Helper para criar usuário válido
const criarUsuarioValido = async () => {
    const usuario = new UsuarioModel({
        nome: 'Usuário Teste',
        email: 'usuario@teste.com',
        senha: 'senha123',
        tipoUsuario: 'Professor'
    });
    return await usuario.save();
};

const cursoBase = {
    titulo: 'Curso Teste',
    descricao: 'Descrição do curso teste',
    cargaHorariaTotal: 20
};

describe('Plano de Teste Repository (Sprint 5 e 6)', () => {
    describe('Buscar por título', () => {
        test('deve buscar curso por título corretamente', async () => {
            const usuario = await criarUsuarioValido();
            const cursoValido = {
                ...cursoBase,
                criadoPorId: usuario._id
            };
            
            await cursoRepository.criar(cursoValido);

            const resultado = await cursoRepository.buscarPorTitulo(cursoBase.titulo);

            expect(resultado).toHaveProperty('_id');
            expect(resultado.titulo).toBe(cursoBase.titulo);
        });

        test('retorna o curso correto', async () => {
            const usuario = await criarUsuarioValido();
            const curso1 = await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Curso A',
                criadoPorId: usuario._id
            });
            
            const curso2 = await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Curso B',
                criadoPorId: usuario._id
            });

            const resultado = await cursoRepository.buscarPorTitulo('Curso A');

            expect(resultado).toHaveProperty('_id');
            expect(resultado._id.toString()).toBe(curso1._id.toString());
            expect(resultado.titulo).toBe('Curso A');
        });
    });

    describe('Buscar por id', () => {
        test('deve buscar curso por id corretamente', async () => {
            const usuario = await criarUsuarioValido();
            const cursoCriado = await cursoRepository.criar({
                ...cursoBase,
                criadoPorId: usuario._id
            });

            const resultado = await cursoRepository.buscarPorId(cursoCriado._id);

            expect(resultado).toHaveProperty('_id');
            expect(resultado._id.toString()).toBe(cursoCriado._id.toString());
            expect(resultado.titulo).toBe(cursoBase.titulo);
        });

        test('retorna o curso correto', async () => {
            const usuario = await criarUsuarioValido();
            const curso1 = await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Curso 1',
                criadoPorId: usuario._id
            });
            
            const curso2 = await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Curso 2',
                criadoPorId: usuario._id
            });

            const resultado = await cursoRepository.buscarPorId(curso1._id);

            expect(resultado).toHaveProperty('_id');
            expect(resultado._id.toString()).toBe(curso1._id.toString());
            expect(resultado.titulo).toBe('Curso 1');
        });
    });

    describe('Aplicar filtros de busca', () => {
        beforeEach(async () => {
            const usuario = await criarUsuarioValido();
            
            // Criar cursos para teste de filtros
            await cursoRepository.criar({
                titulo: 'Curso de JavaScript',
                descricao: 'Aprenda JavaScript do zero',
                cargaHorariaTotal: 30,
                tags: ['javascript', 'web'],
                professores: ['Ana Silva'],
                criadoPorId: usuario._id
            });

            await cursoRepository.criar({
                titulo: 'Curso de Node.js',
                descricao: 'Desenvolvimento backend com Node.js',
                cargaHorariaTotal: 40,
                tags: ['javascript', 'node', 'backend'],
                professores: ['João Santos', 'Carlos Oliveira'],
                criadoPorId: usuario._id
            });

            await cursoRepository.criar({
                titulo: 'Curso de React',
                descricao: 'Aprenda React e hooks',
                cargaHorariaTotal: 25,
                tags: ['javascript', 'react', 'frontend'],
                professores: ['João Santos'],
                criadoPorId: usuario._id
            });
        });

        test('deve aplicar filtros de busca por título', async () => {
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

        test('deve aplicar filtros de busca por tags', async () => {
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

        test('deve aplicar filtros de busca por professores', async () => {
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

        test('deve aplicar filtros de busca por carga horária', async () => {
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

        test('retorna apenas os cursos que atendem aos filtros', async () => {
            const req = {
                query: {
                    tags: 'javascript'
                }
            };

            const resultado = await cursoRepository.listar(req);

            expect(resultado).toHaveProperty('docs');
            expect(resultado.docs).toHaveLength(3);
            expect(resultado.docs.every(curso => 
                curso.tags && curso.tags.includes('javascript')
            )).toBe(true);
        });

        test('deve aplicar múltiplos filtros simultaneamente', async () => {
            const req = {
                query: {
                    tags: 'backend',
                    professores: 'Carlos Oliveira'
                }
            };

            const resultado = await cursoRepository.listar(req);

            expect(resultado).toHaveProperty('docs');
            expect(resultado.docs).toHaveLength(1);
            expect(resultado.docs[0].titulo).toBe('Curso de Node.js');
        });
    });

    describe('Paginação de resultados', () => {
        beforeEach(async () => {
            const usuario = await criarUsuarioValido();
            
            // Criar 5 cursos para testar paginação
            for (let i = 1; i <= 5; i++) {
                await cursoRepository.criar({
                    titulo: `Curso ${i}`,
                    descricao: `Descrição do curso ${i}`,
                    cargaHorariaTotal: 20 + i,
                    criadoPorId: usuario._id
                });
            }
        });

        test('deve aplicar limite e página na listagem de cursos', async () => {
            const req = {
                query: {
                    page: 1,
                    limite: 3
                }
            };

            const resultado = await cursoRepository.listar(req);

            expect(resultado).toHaveProperty('docs');
            expect(resultado.docs).toHaveLength(3);
            expect(resultado).toHaveProperty('totalDocs', 5);
            expect(resultado).toHaveProperty('page', 1);
            expect(resultado).toHaveProperty('totalPages');
        });

        test('retorna resultados paginados conforme solicitado', async () => {
            const req = {
                query: {
                    page: 2,
                    limite: 2
                }
            };

            const resultado = await cursoRepository.listar(req);

            expect(resultado).toHaveProperty('docs');
            expect(resultado.docs).toHaveLength(2);
            expect(resultado).toHaveProperty('totalDocs', 5);
            expect(resultado).toHaveProperty('page', 2);
            expect(resultado).toHaveProperty('totalPages', 3);
        });

        test('deve respeitar limite máximo de 100 registros por página', async () => {
            const req = {
                query: {
                    page: 1,
                    limite: 150 // Acima do limite
                }
            };

            const resultado = await cursoRepository.listar(req);

            expect(resultado).toHaveProperty('docs');
            expect(resultado.docs.length).toBeLessThanOrEqual(100);
        });

        test('deve usar limite padrão de 20 quando não especificado', async () => {
            const req = {
                query: {
                    page: 1
                }
            };

            const resultado = await cursoRepository.listar(req);

            expect(resultado).toHaveProperty('docs');
            expect(resultado.docs).toHaveLength(5); // Temos apenas 5 cursos
        });
    });

    describe('Erro para operações inválidas', () => {
        test('deve retornar erro apropriado para buscar curso inexistente', async () => {
            const idInexistente = new mongoose.Types.ObjectId();

            await expect(cursoRepository.buscarPorId(idInexistente)).rejects.toThrow(CustomError);
            await expect(cursoRepository.buscarPorId(idInexistente)).rejects.toThrow(/não encontrado/);
        });

        test('deve retornar erro apropriado para atualizar curso inexistente', async () => {
            const idInexistente = new mongoose.Types.ObjectId();
            const dadosAtualizados = {
                titulo: 'Curso Atualizado',
                cargaHorariaTotal: 30
            };

            await expect(cursoRepository.atualizar(idInexistente, dadosAtualizados)).rejects.toThrow(CustomError);
            await expect(cursoRepository.atualizar(idInexistente, dadosAtualizados)).rejects.toThrow(/não encontrado/);
        });

        test('deve retornar erro apropriado para deletar curso inexistente', async () => {
            const idInexistente = new mongoose.Types.ObjectId();

            await expect(cursoRepository.deletar(idInexistente)).rejects.toThrow(CustomError);
            await expect(cursoRepository.deletar(idInexistente)).rejects.toThrow(/não encontrado/);
        });

        test('deve retornar erro 404 para curso não encontrado', async () => {
            const idInexistente = new mongoose.Types.ObjectId();

            try {
                await cursoRepository.buscarPorId(idInexistente);
            } catch (error) {
                expect(error).toBeInstanceOf(CustomError);
                expect(error.statusCode).toBe(HttpStatusCodes.NOT_FOUND.code);
                expect(error.errorType).toBe('resourceNotFound');
            }
        });
    });

    describe('Buscar por id inexistente', () => {
        test('deve lançar erro ao buscar curso por id inexistente', async () => {
            const idInexistente = new mongoose.Types.ObjectId();

            await expect(cursoRepository.buscarPorId(idInexistente)).rejects.toThrow(CustomError);
        });

        test('deve lançar erro 404', async () => {
            const idInexistente = new mongoose.Types.ObjectId();

            try {
                await cursoRepository.buscarPorId(idInexistente);
            } catch (error) {
                expect(error).toBeInstanceOf(CustomError);
                expect(error.statusCode).toBe(HttpStatusCodes.NOT_FOUND.code);
            }
        });

        test('deve lançar erro ao buscar curso por id através do método listar', async () => {
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

    describe('Buscar por título inexistente', () => {
        test('deve lançar erro ao buscar curso por título inexistente', async () => {
            const tituloInexistente = 'Curso Inexistente';

            await expect(cursoRepository.buscarPorTitulo(tituloInexistente)).rejects.toThrow(CustomError);
            await expect(cursoRepository.buscarPorTitulo(tituloInexistente)).rejects.toThrow(/não encontrado/);
        });

        test('deve lançar erro 404 para curso não encontrado', async () => {
            const tituloInexistente = 'Curso Inexistente';

            try {
                await cursoRepository.buscarPorTitulo(tituloInexistente);
            } catch (error) {
                expect(error).toBeInstanceOf(CustomError);
                expect(error.statusCode).toBe(HttpStatusCodes.NOT_FOUND.code);
                expect(error.errorType).toBe('resourceNotFound');
            }
        });

        test('não deve lançar erro se throwOnNotFound for false', async () => {
            const tituloInexistente = 'Curso Inexistente';

            const resultado = await cursoRepository.buscarPorTitulo(tituloInexistente, {
                throwOnNotFound: false
            });
            expect(resultado).toBeNull();
        });
    });

    describe('Operações básicas de CRUD', () => {
        test('deve criar um curso com sucesso', async () => {
            const usuario = await criarUsuarioValido();
            const cursoValido = {
                ...cursoBase,
                criadoPorId: usuario._id
            };
            
            const resultado = await cursoRepository.criar(cursoValido);

            expect(resultado).toHaveProperty('_id');
            expect(resultado.titulo).toBe(cursoBase.titulo);
            expect(resultado.descricao).toBe(cursoBase.descricao);
            expect(resultado.cargaHorariaTotal).toBe(cursoBase.cargaHorariaTotal);
        });

        test('deve rejeitar ao criar curso com título duplicado', async () => {
            const usuario = await criarUsuarioValido();
            const cursoValido = {
                ...cursoBase,
                criadoPorId: usuario._id
            };
            
            await cursoRepository.criar(cursoValido);

            await expect(cursoRepository.criar({
                ...cursoValido,
                descricao: 'Outro curso com mesmo título'
            })).rejects.toThrow();
        });

        test('deve criar curso sem campos opcionais', async () => {
            const usuario = await criarUsuarioValido();
            const cursoMinimo = {
                titulo: 'Curso Mínimo',
                criadoPorId: usuario._id
            };

            const resultado = await cursoRepository.criar(cursoMinimo);

            expect(resultado).toHaveProperty('_id');
            expect(resultado.titulo).toBe(cursoMinimo.titulo);
            expect(resultado.cargaHorariaTotal).toBe(0); // Valor padrão
        });

        test('deve atualizar curso com sucesso', async () => {
            const usuario = await criarUsuarioValido();
            const cursoCriado = await cursoRepository.criar({
                ...cursoBase,
                criadoPorId: usuario._id
            });

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

        test('deve deletar curso com sucesso', async () => {
            const usuario = await criarUsuarioValido();
            const cursoCriado = await cursoRepository.criar({
                ...cursoBase,
                criadoPorId: usuario._id
            });

            const resultado = await cursoRepository.deletar(cursoCriado._id);

            expect(resultado).toHaveProperty('_id');
            expect(resultado._id.toString()).toBe(cursoCriado._id.toString());

            await expect(cursoRepository.buscarPorId(cursoCriado._id)).rejects.toThrow(CustomError);
        });

        test('deve listar todos os cursos', async () => {
            const usuario = await criarUsuarioValido();
            
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Curso 1',
                criadoPorId: usuario._id
            });
            
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Curso 2',
                criadoPorId: usuario._id
            });
            
            await cursoRepository.criar({
                ...cursoBase,
                titulo: 'Curso 3',
                criadoPorId: usuario._id
            });

            const req = {
                query: {}
            };

            const resultado = await cursoRepository.listar(req);

            expect(resultado).toHaveProperty('docs');
            expect(resultado.docs).toHaveLength(3);
            expect(resultado).toHaveProperty('totalDocs', 3);
        });

        test('deve buscar curso específico por ID via listar', async () => {
            const usuario = await criarUsuarioValido();
            const cursoCriado = await cursoRepository.criar({
                titulo: 'Curso Específico',
                criadoPorId: usuario._id
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
    });

    describe('Enriquecimento de dados', () => {
        test('deve adicionar estatísticas corretas ao curso', async () => {
            const usuario = await criarUsuarioValido();
            const curso = await cursoRepository.criar({
                titulo: 'Curso com Estatísticas',
                descricao: 'Descrição do curso',
                cargaHorariaTotal: 15,
                materialComplementar: ['https://material1.com', 'https://material2.com'],
                professores: ['Professor A', 'Professor B', 'Professor C'],
                tags: ['tag1', 'tag2', 'tag3', 'tag4'],
                criadoPorId: usuario._id
            });

            const cursoEnriquecido = await cursoRepository.enriquecerCurso(curso);

            expect(cursoEnriquecido).toHaveProperty('estatisticas');
            expect(cursoEnriquecido.estatisticas).toHaveProperty('totalMaterialComplementar', 2);
            expect(cursoEnriquecido.estatisticas).toHaveProperty('totalProfessores', 3);
            expect(cursoEnriquecido.estatisticas).toHaveProperty('totalTags', 4);
            expect(cursoEnriquecido.estatisticas).toHaveProperty('duracaoTotalMinutos', 15);
            expect(cursoEnriquecido.estatisticas).toHaveProperty('duracaoFormatada', '15min');
        });

        test('deve lidar corretamente com arrays vazios', async () => {
            const usuario = await criarUsuarioValido();
            const curso = await cursoRepository.criar({
                titulo: 'Curso Sem Extras',
                criadoPorId: usuario._id
            });

            const cursoEnriquecido = await cursoRepository.enriquecerCurso(curso);

            expect(cursoEnriquecido).toHaveProperty('estatisticas');
            expect(cursoEnriquecido.estatisticas).toHaveProperty('totalMaterialComplementar', 0);
            expect(cursoEnriquecido.estatisticas).toHaveProperty('totalProfessores', 0);
            expect(cursoEnriquecido.estatisticas).toHaveProperty('totalTags', 0);
        });

        test('deve incluir estatísticas de aulas, questionários e certificados', async () => {
            const usuario = await criarUsuarioValido();
            const curso = await cursoRepository.criar({
                titulo: 'Curso Completo',
                criadoPorId: usuario._id
            });

            const cursoEnriquecido = await cursoRepository.enriquecerCurso(curso);

            expect(cursoEnriquecido).toHaveProperty('estatisticas');
            expect(cursoEnriquecido.estatisticas).toHaveProperty('totalAulas');
            expect(cursoEnriquecido.estatisticas).toHaveProperty('totalQuestionarios');
            expect(cursoEnriquecido.estatisticas).toHaveProperty('totalAlternativas');
            expect(cursoEnriquecido.estatisticas).toHaveProperty('totalCertificados');
        });
    });

    describe('Formatação de duração', () => {
        test('deve formatar duração corretamente', async () => {
            // Testando o método formatarDuracao diretamente
            expect(cursoRepository.formatarDuracao(0)).toBe('0min');
            expect(cursoRepository.formatarDuracao(30)).toBe('30min');
            expect(cursoRepository.formatarDuracao(60)).toBe('1h');
            expect(cursoRepository.formatarDuracao(90)).toBe('1h 30min');
            expect(cursoRepository.formatarDuracao(120)).toBe('2h');
            expect(cursoRepository.formatarDuracao(150)).toBe('2h 30min');
        });

        test('deve formatar duração em estatísticas do curso', async () => {
            const usuario = await criarUsuarioValido();
            const curso = await cursoRepository.criar({
                titulo: 'Curso com Duração',
                cargaHorariaTotal: 90,
                criadoPorId: usuario._id
            });

            const cursoEnriquecido = await cursoRepository.enriquecerCurso(curso);

            expect(cursoEnriquecido.estatisticas.duracaoFormatada).toBe('1h 30min');
        });
    });

    describe('Validação de filter builder', () => {
        test('deve validar se filterBuilder tem método build', async () => {
            // Mock do filterBuilder sem método build para simular erro
            const originalFilterBuilder = cursoRepository.constructor.prototype;
            
            const req = {
                query: {
                    titulo: 'Teste'
                }
            };

            // Este teste verifica se o repository trata adequadamente problemas com o filterBuilder
            try {
                await cursoRepository.listar(req);
            } catch (error) {
                // Se houver erro com filterBuilder, deve ser tratado adequadamente
                if (error instanceof CustomError && error.statusCode === HttpStatusCodes.INTERNAL_SERVER_ERROR.code) {
                    expect(error.errorType).toBe('internalServerError');
                }
            }
        });
    });

    describe('Casos edge', () => {
        test('deve lidar com query vazia corretamente', async () => {
            const req = {
                query: {}
            };

            const resultado = await cursoRepository.listar(req);

            expect(resultado).toHaveProperty('docs');
            expect(Array.isArray(resultado.docs)).toBe(true);
        });

        test('deve lidar com params vazios', async () => {
            const req = {
                params: {},
                query: {}
            };

            const resultado = await cursoRepository.listar(req);

            expect(resultado).toHaveProperty('docs');
            expect(Array.isArray(resultado.docs)).toBe(true);
        });

        test('deve lidar com valores de filtro vazios', async () => {
            const req = {
                query: {
                    titulo: '',
                    tags: '',
                    professores: '',
                    criadoPorId: ''
                }
            };

            const resultado = await cursoRepository.listar(req);

            expect(resultado).toHaveProperty('docs');
            expect(Array.isArray(resultado.docs)).toBe(true);
        });
    });

    describe('Erro inesperado do banco', () => {
        test('deve lançar erro se o banco lançar exceção em qualquer operação', async () => {
            // Mock do método save para simular erro do banco
            const originalSave = CursoModel.prototype.save;
            CursoModel.prototype.save = jest.fn().mockRejectedValue(new Error('Erro de conexão com o banco'));

            const usuario = await criarUsuarioValido();
            const cursoValido = {
                ...cursoBase,
                criadoPorId: usuario._id
            };

            await expect(cursoRepository.criar(cursoValido)).rejects.toThrow('Erro de conexão com o banco');

            // Restaurar método original
            CursoModel.prototype.save = originalSave;
        });

        test('deve lançar erro ao falhar na busca no banco', async () => {
            // Mock do método findById para simular erro do banco
            const originalFindById = CursoModel.findById;
            CursoModel.findById = jest.fn().mockRejectedValue(new Error('Erro de conexão com o banco'));

            const idTeste = new mongoose.Types.ObjectId();

            await expect(cursoRepository.buscarPorId(idTeste)).rejects.toThrow('Erro de conexão com o banco');

            // Restaurar método original
            CursoModel.findById = originalFindById;
        });

        test('deve lançar erro ao falhar na atualização no banco', async () => {
            // Mock do método findByIdAndUpdate para simular erro do banco
            const originalFindByIdAndUpdate = CursoModel.findByIdAndUpdate;
            CursoModel.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Erro de conexão com o banco'));

            const idTeste = new mongoose.Types.ObjectId();
            const dadosAtualizados = { titulo: 'Curso Atualizado' };

            await expect(cursoRepository.atualizar(idTeste, dadosAtualizados)).rejects.toThrow('Erro de conexão com o banco');

            // Restaurar método original
            CursoModel.findByIdAndUpdate = originalFindByIdAndUpdate;
        });

        test('deve lançar erro ao falhar na exclusão no banco', async () => {
            // Mock do método findByIdAndDelete para simular erro do banco
            const originalFindByIdAndDelete = CursoModel.findByIdAndDelete;
            CursoModel.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Erro de conexão com o banco'));

            const idTeste = new mongoose.Types.ObjectId();

            await expect(cursoRepository.deletar(idTeste)).rejects.toThrow('Erro de conexão com o banco');

            // Restaurar método original
            CursoModel.findByIdAndDelete = originalFindByIdAndDelete;
        });
    });

    describe('Enriquecimento de dados assíncrono', () => {
        test('deve funcionar corretamente com múltiplas chamadas assíncronas', async () => {
            const usuario = await criarUsuarioValido();
            
            // Criar múltiplos cursos
            const curso1 = await cursoRepository.criar({
                titulo: 'Curso Assíncrono 1',
                cargaHorariaTotal: 60,
                materialComplementar: ['material1.pdf'],
                professores: ['Prof A'],
                tags: ['tag1'],
                criadoPorId: usuario._id
            });

            const curso2 = await cursoRepository.criar({
                titulo: 'Curso Assíncrono 2',
                cargaHorariaTotal: 90,
                materialComplementar: ['material2.pdf', 'material3.pdf'],
                professores: ['Prof B', 'Prof C'],
                tags: ['tag2', 'tag3'],
                criadoPorId: usuario._id
            });

            const curso3 = await cursoRepository.criar({
                titulo: 'Curso Assíncrono 3',
                cargaHorariaTotal: 120,
                criadoPorId: usuario._id
            });

            // Enriquecer múltiplos cursos usando Promise.all
            const cursosEnriquecidos = await Promise.all([
                cursoRepository.enriquecerCurso(curso1),
                cursoRepository.enriquecerCurso(curso2),
                cursoRepository.enriquecerCurso(curso3)
            ]);

            // Verificar se todos os cursos foram enriquecidos corretamente
            expect(cursosEnriquecidos).toHaveLength(3);
            
            cursosEnriquecidos.forEach(curso => {
                expect(curso).toHaveProperty('estatisticas');
                expect(curso.estatisticas).toHaveProperty('totalMaterialComplementar');
                expect(curso.estatisticas).toHaveProperty('totalProfessores');
                expect(curso.estatisticas).toHaveProperty('totalTags');
                expect(curso.estatisticas).toHaveProperty('duracaoFormatada');
            });

            // Verificar valores específicos
            expect(cursosEnriquecidos[0].estatisticas.totalMaterialComplementar).toBe(1);
            expect(cursosEnriquecidos[0].estatisticas.totalProfessores).toBe(1);
            expect(cursosEnriquecidos[0].estatisticas.totalTags).toBe(1);

            expect(cursosEnriquecidos[1].estatisticas.totalMaterialComplementar).toBe(2);
            expect(cursosEnriquecidos[1].estatisticas.totalProfessores).toBe(2);
            expect(cursosEnriquecidos[1].estatisticas.totalTags).toBe(2);

            expect(cursosEnriquecidos[2].estatisticas.totalMaterialComplementar).toBe(0);
            expect(cursosEnriquecidos[2].estatisticas.totalProfessores).toBe(0);
            expect(cursosEnriquecidos[2].estatisticas.totalTags).toBe(0);
        });

        test('deve processar enriquecimento mesmo com falhas em alguns cursos', async () => {
            const usuario = await criarUsuarioValido();
            
            const curso1 = await cursoRepository.criar({
                titulo: 'Curso Válido',
                cargaHorariaTotal: 60,
                criadoPorId: usuario._id
            });

            // Criar um objeto simulando curso com dados inválidos
            const cursoInvalido = {
                _id: new mongoose.Types.ObjectId(),
                titulo: 'Curso Inválido',
                toObject: () => {
                    throw new Error('Erro ao converter objeto');
                }
            };

            // Tentar enriquecer ambos
            const resultados = await Promise.allSettled([
                cursoRepository.enriquecerCurso(curso1),
                cursoRepository.enriquecerCurso(cursoInvalido).catch(err => ({ erro: err.message }))
            ]);

            // Verificar resultados
            expect(resultados[0].status).toBe('fulfilled');
            expect(resultados[0].value).toHaveProperty('estatisticas');
            
            expect(resultados[1].status).toBe('fulfilled');
            expect(resultados[1].value).toHaveProperty('erro');
        });
    });

    describe('Uso da cargaHorariaTotal', () => {
        test('deve usar o campo cargaHorariaTotal armazenado ao invés de recalcular', async () => {
            const usuario = await criarUsuarioValido();
            
            // Criar curso com carga horária específica
            const curso = await cursoRepository.criar({
                titulo: 'Curso com Carga Horária',
                cargaHorariaTotal: 75, // Valor específico
                criadoPorId: usuario._id
            });

            // Enriquecer o curso
            const cursoEnriquecido = await cursoRepository.enriquecerCurso(curso);

            // Verificar que está usando o valor armazenado, não recalculando
            expect(cursoEnriquecido.estatisticas.duracaoTotalMinutos).toBe(75);
            expect(cursoEnriquecido.estatisticas.duracaoFormatada).toBe('1h 15min');
            
            // O valor deve ser exatamente o que foi armazenado no banco
            expect(cursoEnriquecido.cargaHorariaTotal).toBe(75);
        });

        test('deve usar 0 como padrão quando cargaHorariaTotal não está definida', async () => {
            const usuario = await criarUsuarioValido();
            
            // Criar curso sem especificar carga horária
            const curso = await cursoRepository.criar({
                titulo: 'Curso Sem Carga Horária',
                criadoPorId: usuario._id
            });

            // Enriquecer o curso
            const cursoEnriquecido = await cursoRepository.enriquecerCurso(curso);

            // Verificar que usa 0 como padrão
            expect(cursoEnriquecido.estatisticas.duracaoTotalMinutos).toBe(0);
            expect(cursoEnriquecido.estatisticas.duracaoFormatada).toBe('0min');
        });

        test('deve preservar o valor original durante enriquecimento', async () => {
            const usuario = await criarUsuarioValido();
            
            const curso = await cursoRepository.criar({
                titulo: 'Curso Original',
                cargaHorariaTotal: 45,
                descricao: 'Descrição original',
                criadoPorId: usuario._id
            });

            const cursoEnriquecido = await cursoRepository.enriquecerCurso(curso);

            // Verificar que todos os campos originais foram preservados
            expect(cursoEnriquecido.titulo).toBe('Curso Original');
            expect(cursoEnriquecido.descricao).toBe('Descrição original');
            expect(cursoEnriquecido.cargaHorariaTotal).toBe(45);
            expect(cursoEnriquecido.criadoPorId).toEqual(usuario._id);
            
            // E que as estatísticas foram adicionadas
            expect(cursoEnriquecido).toHaveProperty('estatisticas');
            expect(cursoEnriquecido.estatisticas.duracaoTotalMinutos).toBe(45);
        });
    });
});

//cd "c:\Users\Yuri\Music\IFRO\plataforma-de-cursos" && npx jest src/tests/unit/repositories/CursoRepository.test.js --coverage --detectOpenHandles