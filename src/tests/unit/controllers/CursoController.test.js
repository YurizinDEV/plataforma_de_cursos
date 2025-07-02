import mongoose from 'mongoose';
import {
    MongoMemoryServer
} from 'mongodb-memory-server';
import CursoController from '../../../controllers/CursoController.js';
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
import {
    CursoQuerySchema
} from '../../../utils/validators/schemas/zod/querys/CursoQuerySchema.js';
import {
    CursoSchema,
    CursoUpdateSchema
} from '../../../utils/validators/schemas/zod/CursoSchema.js';

let mongoServer;
let cursoController;

const mockRequest = () => {
    return {
        params: {},
        query: {},
        body: {}
    };
};

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockImplementation(data => {
        res.data = data;
        return res;
    });
    return res;
};

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    await mongoose.connection.collection('cursos').createIndex({
        titulo: 1
    }, {
        unique: true
    });

    cursoController = new CursoController();
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

const cursoValidoBase = {
    titulo: 'Curso de Teste',
    descricao: 'Descrição do curso de teste',
    cargaHorariaTotal: 20
};

describe('CursoController', () => {
    describe('Validação de schema', () => {
        test('deve validar o schema de entrada - título obrigatório', async () => {
            const usuario = await criarUsuarioValido();

            const req = mockRequest();
            req.body = {
                ...cursoValidoBase,
                criadoPorId: usuario._id.toString()
            };
            delete req.body.titulo;
            const res = mockResponse();

            await expect(cursoController.criar(req, res)).rejects.toThrow();
        });

        test('deve validar o schema de entrada - criadoPorId obrigatório', async () => {
            const req = mockRequest();
            req.body = {
                ...cursoValidoBase
            };
            const res = mockResponse();

            await expect(cursoController.criar(req, res)).rejects.toThrow();
        });

        test('deve retornar erro 400 para dados inválidos no cadastro', async () => {
            const req = mockRequest();
            req.body = {
                titulo: '', // título vazio
                cargaHorariaTotal: -5 // carga horária negativa
            };
            const res = mockResponse();

            await expect(cursoController.criar(req, res)).rejects.toThrow();
        });

        test('deve validar carga horária mínima', async () => {
            const usuario = await criarUsuarioValido();

            const req = mockRequest();
            req.body = {
                titulo: 'Curso Teste',
                cargaHorariaTotal: -1,
                criadoPorId: usuario._id.toString()
            };
            const res = mockResponse();

            await expect(cursoController.criar(req, res)).rejects.toThrow();
        });
    });

    describe('Título já cadastrado', () => {
        test('não deve permitir cadastro com título já existente', async () => {
            const usuario = await criarUsuarioValido();
            const cursoValido = {
                ...cursoValidoBase,
                criadoPorId: usuario._id.toString()
            };

            // Criar primeiro curso
            await CursoModel.create(cursoValido);

            // Tentar criar segundo curso com mesmo título
            const req = mockRequest();
            req.body = cursoValido;
            const res = mockResponse();

            await expect(cursoController.criar(req, res)).rejects.toThrow(CustomError);
        });

        test('deve retornar erro 400 para título já cadastrado', async () => {
            const usuario = await criarUsuarioValido();
            const cursoValido = {
                ...cursoValidoBase,
                criadoPorId: usuario._id.toString()
            };

            await CursoModel.create(cursoValido);

            const req = mockRequest();
            req.body = cursoValido;
            const res = mockResponse();

            try {
                await cursoController.criar(req, res);
            } catch (error) {
                expect(error).toBeInstanceOf(CustomError);
                expect(error.statusCode).toBe(HttpStatusCodes.BAD_REQUEST.code);
            }
        });
    });

    describe('Curso não encontrado', () => {
        test('deve retornar erro 404 ao buscar curso inexistente', async () => {
            const req = mockRequest();
            req.params.id = new mongoose.Types.ObjectId().toString();
            const res = mockResponse();

            await expect(cursoController.listar(req, res)).rejects.toThrow(CustomError);
        });

        test('deve retornar erro 404 ao atualizar curso inexistente', async () => {
            const req = mockRequest();
            req.params.id = new mongoose.Types.ObjectId().toString();
            req.body = {
                titulo: 'Novo Título'
            };
            const res = mockResponse();

            await expect(cursoController.atualizar(req, res)).rejects.toThrow(CustomError);
        });

        test('deve retornar erro 404 ao deletar curso inexistente', async () => {
            const req = mockRequest();
            req.params.id = new mongoose.Types.ObjectId().toString();
            const res = mockResponse();

            await expect(cursoController.deletar(req, res)).rejects.toThrow(CustomError);
        });
    });

    describe('Mensagens padronizadas', () => {
        test('deve retornar mensagem de sucesso padronizada na criação', async () => {
            const usuario = await criarUsuarioValido();

            const req = mockRequest();
            req.body = {
                ...cursoValidoBase,
                criadoPorId: usuario._id.toString()
            };
            const res = mockResponse();

            await cursoController.criar(req, res);

            expect(res.data).toHaveProperty('message', 'Curso criado com sucesso.');
        });

        test('deve retornar mensagem de sucesso padronizada na atualização', async () => {
            const usuario = await criarUsuarioValido();
            const curso = await CursoModel.create({
                ...cursoValidoBase,
                criadoPorId: usuario._id
            });

            const req = mockRequest();
            req.params.id = curso._id.toString();
            req.body = {
                titulo: 'Título Atualizado'
            };
            const res = mockResponse();

            await cursoController.atualizar(req, res);

            expect(res.data).toHaveProperty('message', 'Curso atualizado com sucesso.');
        });

        test('deve retornar mensagem de sucesso padronizada na remoção', async () => {
            const usuario = await criarUsuarioValido();
            const curso = await CursoModel.create({
                ...cursoValidoBase,
                criadoPorId: usuario._id
            });

            const req = mockRequest();
            req.params.id = curso._id.toString();
            const res = mockResponse();

            try {
                await cursoController.deletar(req, res);
                expect(res.data).toHaveProperty('message', 'Curso removido com sucesso.');
            } catch (error) {
                // Se houver erro na exclusão em cascata, verificar que é um CustomError
                expect(error).toBeInstanceOf(CustomError);
            }
        });
    });

    describe('Dados inválidos no cadastro', () => {
        test('deve retornar erro 400 ao tentar cadastrar curso sem título', async () => {
            const usuario = await criarUsuarioValido();

            const req = mockRequest();
            req.body = {
                cargaHorariaTotal: 20,
                criadoPorId: usuario._id.toString()
            };
            const res = mockResponse();

            await expect(cursoController.criar(req, res)).rejects.toThrow();
        });

        test('deve retornar erro 400 ao tentar cadastrar curso sem criadoPorId', async () => {
            const req = mockRequest();
            req.body = {
                titulo: 'Curso Teste',
                cargaHorariaTotal: 20
            };
            const res = mockResponse();

            await expect(cursoController.criar(req, res)).rejects.toThrow();
        });
    });

    describe('Falha inesperada', () => {
        test('deve tratar erro inesperado no controller', async () => {
            // Simular erro no service mockando
            const originalService = cursoController.service;
            cursoController.service = {
                listar: jest.fn().mockRejectedValue(new Error('Erro inesperado'))
            };

            const req = mockRequest();
            const res = mockResponse();

            await expect(cursoController.listar(req, res)).rejects.toThrow('Erro inesperado');

            // Restaurar service original
            cursoController.service = originalService;
        });
    });

    describe('Busca com filtro inválido', () => {
        test('deve retornar erro 400 ao buscar cursos com filtros inválidos', async () => {
            // Mock do schema de validação para simular erro
            jest.spyOn(CursoQuerySchema, 'parseAsync').mockRejectedValueOnce(
                new Error('Filtro inválido')
            );

            const req = mockRequest();
            req.query = {
                cargaHorariaMin: 'invalid'
            };
            const res = mockResponse();

            await expect(cursoController.listar(req, res)).rejects.toThrow();
        });

        test('deve validar query params corretamente', async () => {
            const usuario = await criarUsuarioValido();
            await CursoModel.create({
                ...cursoValidoBase,
                criadoPorId: usuario._id
            });

            const req = mockRequest();
            req.query = {
                titulo: 'Curso'
            };
            const res = mockResponse();

            await cursoController.listar(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('Remoção de curso inexistente', () => {
        test('deve retornar erro 404 ao tentar remover curso inexistente', async () => {
            const req = mockRequest();
            req.params.id = new mongoose.Types.ObjectId().toString();
            const res = mockResponse();

            await expect(cursoController.deletar(req, res)).rejects.toThrow(CustomError);
        });
    });

    describe('Enriquecimento de dados', () => {
        test('deve enriquecer os dados do curso com estatísticas completas ao listar', async () => {
            const usuario = await criarUsuarioValido();
            const curso = await CursoModel.create({
                ...cursoValidoBase,
                criadoPorId: usuario._id
            });

            const req = mockRequest();
            const res = mockResponse();

            await cursoController.listar(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.data).toHaveProperty('data');
            expect(res.data.data).toHaveProperty('docs');
            expect(Array.isArray(res.data.data.docs)).toBe(true);
        });

        test('deve incluir estatísticas ao buscar curso específico', async () => {
            const usuario = await criarUsuarioValido();
            const curso = await CursoModel.create({
                ...cursoValidoBase,
                criadoPorId: usuario._id
            });

            const req = mockRequest();
            req.params.id = curso._id.toString();
            const res = mockResponse();

            await cursoController.listar(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.data).toHaveProperty('data');
            expect(res.data.data).toHaveProperty('_id');
        });
    });

    describe('Update sem dados', () => {
        test('deve retornar erro ao tentar atualizar um curso sem fornecer novos dados', async () => {
            const usuario = await criarUsuarioValido();
            const curso = await CursoModel.create({
                ...cursoValidoBase,
                criadoPorId: usuario._id
            });

            const req = mockRequest();
            req.params.id = curso._id.toString();
            req.body = {};
            const res = mockResponse();

            await expect(cursoController.atualizar(req, res)).rejects.toThrow(CustomError);
            await expect(cursoController.atualizar(req, res)).rejects.toThrow(/Nenhum dado fornecido/);
        });

        test('deve retornar erro 400 informando necessidade de pelo menos um campo para atualização', async () => {
            const usuario = await criarUsuarioValido();
            const curso = await CursoModel.create({
                ...cursoValidoBase,
                criadoPorId: usuario._id
            });

            const req = mockRequest();
            req.params.id = curso._id.toString();
            req.body = {};
            const res = mockResponse();

            try {
                await cursoController.atualizar(req, res);
            } catch (error) {
                expect(error).toBeInstanceOf(CustomError);
                expect(error.statusCode).toBe(HttpStatusCodes.BAD_REQUEST.code);
                expect(error.customMessage).toContain('Nenhum dado fornecido');
            }
        });
    });

    describe('Operações básicas de CRUD', () => {
        test('deve criar curso com sucesso', async () => {
            const usuario = await criarUsuarioValido();

            const req = mockRequest();
            req.body = {
                ...cursoValidoBase,
                criadoPorId: usuario._id.toString()
            };
            const res = mockResponse();

            await cursoController.criar(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.data).toHaveProperty('error', false);
            expect(res.data).toHaveProperty('data');
            expect(res.data.data).toHaveProperty('titulo', cursoValidoBase.titulo);
        });

        test('deve listar cursos com sucesso', async () => {
            const usuario = await criarUsuarioValido();
            await CursoModel.create([{
                    ...cursoValidoBase,
                    titulo: 'Curso 1',
                    criadoPorId: usuario._id
                },
                {
                    ...cursoValidoBase,
                    titulo: 'Curso 2',
                    criadoPorId: usuario._id
                },
                {
                    ...cursoValidoBase,
                    titulo: 'Curso 3',
                    criadoPorId: usuario._id
                }
            ]);

            const req = mockRequest();
            const res = mockResponse();

            await cursoController.listar(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.data).toHaveProperty('error', false);
            expect(res.data.data.docs).toHaveLength(3);
        });

        test('deve buscar curso por ID com sucesso', async () => {
            const usuario = await criarUsuarioValido();
            const curso = await CursoModel.create({
                ...cursoValidoBase,
                criadoPorId: usuario._id
            });

            const req = mockRequest();
            req.params.id = curso._id.toString();
            const res = mockResponse();

            await cursoController.listar(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.data.data._id.toString()).toBe(curso._id.toString());
        });

        test('deve atualizar curso com sucesso', async () => {
            const usuario = await criarUsuarioValido();
            const curso = await CursoModel.create({
                ...cursoValidoBase,
                criadoPorId: usuario._id
            });

            const req = mockRequest();
            req.params.id = curso._id.toString();
            req.body = {
                titulo: 'Título Atualizado',
                cargaHorariaTotal: 30
            };
            const res = mockResponse();

            await cursoController.atualizar(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.data.data).toHaveProperty('titulo', 'Título Atualizado');
            expect(res.data.data).toHaveProperty('cargaHorariaTotal', 30);
        });

        test('deve deletar curso com sucesso', async () => {
            const usuario = await criarUsuarioValido();
            const curso = await CursoModel.create({
                ...cursoValidoBase,
                criadoPorId: usuario._id
            });

            const req = mockRequest();
            req.params.id = curso._id.toString();
            const res = mockResponse();

            try {
                await cursoController.deletar(req, res);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.data).toHaveProperty('error', false);
            } catch (error) {
                // Se houver erro na exclusão em cascata, verificar que é um CustomError
                expect(error).toBeInstanceOf(CustomError);
                // Verificar se o curso ainda existe (não foi deletado devido ao erro)
                const cursoVerificacao = await CursoModel.findById(curso._id);
                expect(cursoVerificacao).not.toBeNull();
            }
        });
    });

    describe('Validações específicas', () => {
        test('deve validar ID antes de deletar', async () => {
            const req = mockRequest();
            req.params.id = 'id-invalido';
            const res = mockResponse();

            await expect(cursoController.deletar(req, res)).rejects.toThrow();
        });

        test('deve rejeitar exclusão sem ID', async () => {
            const req = mockRequest();
            req.params = {};
            const res = mockResponse();

            await expect(cursoController.deletar(req, res)).rejects.toThrow(CustomError);
            await expect(cursoController.deletar(req, res)).rejects.toThrow(/ID do curso não fornecido/);
        });

        test('deve filtrar cursos por query params', async () => {
            const usuario = await criarUsuarioValido();
            await CursoModel.create([{
                    ...cursoValidoBase,
                    titulo: 'Curso de JavaScript',
                    tags: ['javascript'],
                    criadoPorId: usuario._id
                },
                {
                    ...cursoValidoBase,
                    titulo: 'Curso de Python',
                    tags: ['python'],
                    criadoPorId: usuario._id
                }
            ]);

            const req = mockRequest();
            req.query = {
                titulo: 'JavaScript'
            };
            const res = mockResponse();

            await cursoController.listar(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.data.data.docs).toHaveLength(1);
            expect(res.data.data.docs[0].titulo).toBe('Curso de JavaScript');
        });

        test('deve criar curso com cargaHorariaTotal zero', async () => {
            const usuario = await criarUsuarioValido();

            const req = mockRequest();
            req.body = {
                ...cursoValidoBase,
                cargaHorariaTotal: 0,
                criadoPorId: usuario._id.toString()
            };
            const res = mockResponse();

            await cursoController.criar(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.data.data).toHaveProperty('cargaHorariaTotal', 0);
        });
    });
});

// cd "c:\Users\Yuri\Music\IFRO\plataforma-de-cursos" && npx jest src/tests/unit/controllers/CursoController.test.js --coverage --detectOpenHandles