import mongoose from 'mongoose';
import {
    MongoMemoryServer
} from 'mongodb-memory-server';
import bcrypt from 'bcrypt';
import UsuarioController from '../../../controllers/UsuarioController.js';
import UsuarioModel from '../../../models/Usuario.js';
import {
    UsuarioQuerySchema
} from '../../../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';
import {
    ObjectIdSchema
} from '../../../utils/validators/schemas/zod/ObjectIdSchema.js';
import {
    CustomError
} from '../../../utils/helpers/index.js';

let mongoServer;
let usuarioController;
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

    await mongoose.connection.collection('usuarios').createIndex({
        email: 1
    }, {
        unique: true
    });

    usuarioController = new UsuarioController();
});

beforeEach(async () => {
    await UsuarioModel.deleteMany({});
    jest.clearAllMocks();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

const usuarioValido = {
    nome: 'Usuário Teste',
    email: 'usuario@teste.com',
    senha: 'Senha@123'
};

describe('UsuarioController', () => {
    test('deve instanciar o controller corretamente com serviço', () => {
        const controller = new UsuarioController();
        expect(controller).toBeInstanceOf(UsuarioController);
        expect(controller.service).toBeDefined();
    });
    describe('Método listar', () => {
        test('deve lidar com erro interno do serviço', async () => {

            const mockService = usuarioController.service;
            const originalListar = mockService.listar;
            mockService.listar = jest.fn().mockRejectedValue(new Error('Erro interno do serviço'));

            const req = mockRequest();
            const res = mockResponse();

            await expect(usuarioController.listar(req, res)).rejects.toThrow('Erro interno do serviço');

            mockService.listar = originalListar;
        });

        test('deve listar todos os usuários quando não há filtros', async () => {
            await UsuarioModel.create([{
                    nome: 'Usuário 1',
                    email: 'usuario1@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10)
                },
                {
                    nome: 'Usuário 2',
                    email: 'usuario2@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10)
                }
            ]);

            const req = mockRequest();
            const res = mockResponse();

            await usuarioController.listar(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();
            expect(res.data.data.docs).toBeDefined();
            expect(res.data.data.docs.length).toBe(2);
            expect(res.data.data.totalDocs).toBe(2);
        });

        test('deve filtrar usuários por nome corretamente', async () => {
            await UsuarioModel.create([{
                    nome: 'João Silva',
                    email: 'joao@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10)
                },
                {
                    nome: 'Maria Santos',
                    email: 'maria@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10)
                }
            ]);

            const req = mockRequest();
            req.query = {
                nome: 'João'
            };
            const res = mockResponse();

            await usuarioController.listar(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();
            expect(res.data.data.docs.length).toBe(1);
            expect(res.data.data.docs[0].nome).toContain('João');
        });

        test('deve filtrar usuários por email corretamente', async () => {
            await UsuarioModel.create([{
                    nome: 'João Silva',
                    email: 'joao@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10)
                },
                {
                    nome: 'Maria Santos',
                    email: 'maria@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10)
                }
            ]);

            const req = mockRequest();
            req.query = {
                email: 'maria@teste.com'
            };
            const res = mockResponse();

            await usuarioController.listar(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();
            expect(res.data.data.docs.length).toBe(1);
            expect(res.data.data.docs[0].email).toBe('maria@teste.com');
        });

        test('deve filtrar usuários por status ativo corretamente', async () => {
            await UsuarioModel.create([{
                    nome: 'João Silva',
                    email: 'joao@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10),
                    ativo: true
                },
                {
                    nome: 'Maria Santos',
                    email: 'maria@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10),
                    ativo: false
                }
            ]);

            const req = mockRequest();
            req.query = {
                ativo: 'true'
            };
            const res = mockResponse();

            await usuarioController.listar(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();
            expect(res.data.data.docs.length).toBe(1);
            expect(res.data.data.docs[0].ativo).toBe(true);
        });

        test('deve falhar com erro 400 ao usar filtro inválido', async () => {
            const req = mockRequest();
            req.query = {
                email: 'email-invalido'
            };
            const res = mockResponse();

            await expect(usuarioController.listar(req, res)).rejects.toThrow();
        });

        test('deve buscar usuário por ID corretamente', async () => {
            const usuario = await UsuarioModel.create({
                nome: 'Usuário Teste',
                email: 'usuario@teste.com',
                senha: await bcrypt.hash('Senha@123', 10)
            });

            const req = mockRequest();
            req.params = {
                id: usuario._id.toString()
            };
            const res = mockResponse();

            await usuarioController.listar(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();

            expect(res.data.data._id.toString()).toBe(usuario._id.toString());

            expect(res.data.data.nome).toBe(usuario.nome);
            expect(res.data.data.email).toBe(usuario.email);
        });

        test('deve validar e processar query params corretamente', async () => {
            const originalParseAsync = UsuarioQuerySchema.parseAsync;
            UsuarioQuerySchema.parseAsync = jest.fn().mockResolvedValue({
                nome: 'João',
                page: 1
            });

            const req = mockRequest();
            req.query = {
                nome: 'João',
                page: 1
            };
            const res = mockResponse();

            const listarSpy = jest.spyOn(usuarioController.service, 'listar')
                .mockResolvedValue({
                    docs: [],
                    totalDocs: 0
                });

            await usuarioController.listar(req, res);

            expect(UsuarioQuerySchema.parseAsync).toHaveBeenCalledWith(req.query);
            expect(listarSpy).toHaveBeenCalledWith(req);
            expect(res.status).toHaveBeenCalledWith(200);

            UsuarioQuerySchema.parseAsync = originalParseAsync;
            listarSpy.mockRestore();
        });

        test('deve pular validação quando query params estiverem vazios', async () => {
            const originalParseAsync = UsuarioQuerySchema.parseAsync;
            UsuarioQuerySchema.parseAsync = jest.fn().mockResolvedValue({});

            const req = mockRequest();
            req.query = {};
            const res = mockResponse();

            const listarSpy = jest.spyOn(usuarioController.service, 'listar')
                .mockResolvedValue({
                    docs: [],
                    totalDocs: 0
                });

            await usuarioController.listar(req, res);

            expect(UsuarioQuerySchema.parseAsync).not.toHaveBeenCalled();
            expect(listarSpy).toHaveBeenCalledWith(req);
            expect(res.status).toHaveBeenCalledWith(200);

            UsuarioQuerySchema.parseAsync = originalParseAsync;
            listarSpy.mockRestore();
        });

        test('deve lançar erro quando ID na listagem é inválido', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.params = {
                id: 'id-invalido'
            };

            await expect(usuarioController.listar(req, res)).rejects.toThrow();

            try {
                await usuarioController.listar(req, res);
                fail('Deveria ter lançado um erro');
            } catch (error) {
                expect(error.message).toContain("ID inválido");
            }
        });

        test('deve lançar erro quando query tem campos inválidos', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.query = {
                ativo: 'nao-booleano'
            };

            await expect(usuarioController.listar(req, res)).rejects.toThrow();

            try {
                await usuarioController.listar(req, res);
            } catch (error) {
                expect(error.message).toContain("Ativo deve ser 'true' ou 'false'");
            }
        });
    });

    describe('Método criar', () => {
        const usuarioValido = {
            nome: 'Usuário Teste',
            email: 'teste@usuario.com',
            senha: 'Senha@123'
        };

        test('deve lidar com erro interno do serviço', async () => {
            const mockService = usuarioController.service;
            const originalCriar = mockService.criar;
            mockService.criar = jest.fn().mockRejectedValue(new Error('Erro interno do serviço'));

            const req = mockRequest();
            req.body = {
                ...usuarioValido
            };
            const res = mockResponse();

            await expect(usuarioController.criar(req, res)).rejects.toThrow('Erro interno do serviço');

            mockService.criar = originalCriar;
        });

        test('deve criar um usuário válido com sucesso', async () => {
            const req = mockRequest();
            req.body = {
                ...usuarioValido
            };
            const res = mockResponse();

            await usuarioController.criar(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalled();
            expect(res.data.data.nome).toBe(usuarioValido.nome);
            expect(res.data.data.email).toBe(usuarioValido.email);
            expect(res.data.data.senha).toBeUndefined();

            const usuarioSalvo = await UsuarioModel.findOne({
                email: usuarioValido.email
            });
            expect(usuarioSalvo).not.toBeNull();
            expect(usuarioSalvo.nome).toBe(usuarioValido.nome);

            expect(usuarioSalvo.senha).not.toBe(usuarioValido.senha);
        });

        test('deve falhar ao criar usuário sem nome', async () => {
            const req = mockRequest();
            req.body = {
                email: usuarioValido.email,
                senha: usuarioValido.senha
            };
            const res = mockResponse();

            await expect(usuarioController.criar(req, res)).rejects.toThrow();
        });

        test('deve falhar ao criar usuário sem email', async () => {
            const req = mockRequest();
            req.body = {
                nome: usuarioValido.nome,
                senha: usuarioValido.senha
            };
            const res = mockResponse();

            await expect(usuarioController.criar(req, res)).rejects.toThrow();
        });

        test('deve falhar ao criar usuário sem senha', async () => {
            const req = mockRequest();
            req.body = {
                nome: usuarioValido.nome,
                email: usuarioValido.email
            };
            const res = mockResponse();

            await expect(usuarioController.criar(req, res)).rejects.toThrow();
        });

        test('deve falhar ao criar usuário com email já existente', async () => {
            await UsuarioModel.create({
                nome: 'Usuário Existente',
                email: usuarioValido.email,
                senha: await bcrypt.hash(usuarioValido.senha, 10)
            });

            const req = mockRequest();
            req.body = {
                ...usuarioValido
            };
            const res = mockResponse();

            await expect(usuarioController.criar(req, res)).rejects.toThrow();
        });
        test('deve criar usuário com valores padrão para ehAdmin e ativo', async () => {
            const req = mockRequest();
            req.body = {
                ...usuarioValido
            };
            const res = mockResponse();

            await usuarioController.criar(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalled();
            expect(res.data.data.ehAdmin).toBe(false);
            expect(res.data.data.ativo).toBe(false);

            const usuarioSalvo = await UsuarioModel.findOne({
                email: usuarioValido.email
            });
            expect(usuarioSalvo.ehAdmin).toBe(false);
            expect(usuarioSalvo.ativo).toBe(false);
        });
        test('deve falhar ao criar usuário com senha inválida (sem requisitos mínimos)', async () => {
            const req = mockRequest();
            req.body = {
                nome: usuarioValido.nome,
                email: usuarioValido.email,
                senha: 'senha123'
            };
            const res = mockResponse();

            await expect(usuarioController.criar(req, res)).rejects.toThrow();
        });
        test('deve criar usuário com campos opcionais', async () => {
            const emailUnico = `admin${Date.now()}@teste.com`;
            const req = mockRequest();
            req.body = {
                nome: 'Usuário Administrador',
                email: emailUnico,
                senha: 'Senha@123',
                ehAdmin: true,
                ativo: true
            };
            const res = mockResponse();

            await usuarioController.criar(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalled();
            expect(res.data.data.ehAdmin).toBe(true);
            expect(res.data.data.ativo).toBe(true);

            const usuarioSalvo = await UsuarioModel.findOne({
                email: emailUnico
            });
            expect(usuarioSalvo).not.toBeNull();
            expect(usuarioSalvo.ehAdmin).toBe(true);
            expect(usuarioSalvo.ativo).toBe(true);
        });
    });

    describe('Método atualizar', () => {
        let usuarioExistente;

        beforeEach(async () => {
            usuarioExistente = await UsuarioModel.create({
                nome: 'Usuário para Atualizar',
                email: 'atualizar@teste.com',
                senha: await bcrypt.hash('Senha@123', 10),
                ativo: false
            });
        });
        test('deve lidar com erro interno do serviço', async () => {
            const mockService = usuarioController.service;
            const originalAtualizar = mockService.atualizar;
            mockService.atualizar = jest.fn().mockRejectedValue(new Error('Erro interno do serviço'));

            const req = mockRequest();
            req.params = {
                id: usuarioExistente._id.toString()
            };
            req.body = {
                nome: 'Nome Atualizado'
            };
            const res = mockResponse();

            await expect(usuarioController.atualizar(req, res)).rejects.toThrow('Erro interno do serviço');

            mockService.atualizar = originalAtualizar;
        });

        test('deve atualizar o nome do usuário com sucesso', async () => {
            const req = mockRequest();
            req.params = {
                id: usuarioExistente._id.toString()
            };
            req.body = {
                nome: 'Nome Atualizado'
            };
            const res = mockResponse();

            await usuarioController.atualizar(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();
            expect(res.data.data.nome).toBe('Nome Atualizado');
            expect(res.data.data.email).toBe(usuarioExistente.email);
            expect(res.data.data.senha).toBeUndefined();

            const usuarioAtualizado = await UsuarioModel.findById(usuarioExistente._id);
            expect(usuarioAtualizado.nome).toBe('Nome Atualizado');
        });

        test('deve atualizar o status ativo do usuário com sucesso', async () => {
            const req = mockRequest();
            req.params = {
                id: usuarioExistente._id.toString()
            };
            req.body = {
                ativo: true
            };
            const res = mockResponse();

            await usuarioController.atualizar(req, res);

            const usuarioAtualizado = await UsuarioModel.findById(usuarioExistente._id);
            expect(usuarioAtualizado.ativo).toBe(true);
        });

        test('não deve permitir atualizar o email do usuário', async () => {
            const req = mockRequest();
            req.params = {
                id: usuarioExistente._id.toString()
            };
            req.body = {
                nome: 'Nome Atualizado',
                email: 'novo@email.com'
            };
            const res = mockResponse();

            await usuarioController.atualizar(req, res);

            const usuarioAtualizado = await UsuarioModel.findById(usuarioExistente._id);
            expect(usuarioAtualizado.nome).toBe('Nome Atualizado');
            expect(usuarioAtualizado.email).toBe(usuarioExistente.email);
        });

        test('não deve permitir atualizar a senha do usuário diretamente', async () => {
            const senhaOriginal = usuarioExistente.senha;

            const req = mockRequest();
            req.params = {
                id: usuarioExistente._id.toString()
            };
            req.body = {
                senha: 'NovaSenha@123'
            };
            const res = mockResponse();

            await usuarioController.atualizar(req, res);


            const usuarioAtualizado = await UsuarioModel.findById(usuarioExistente._id);
            expect(usuarioAtualizado.senha).toBe(senhaOriginal);
        });

        test('deve falhar ao tentar atualizar um usuário inexistente', async () => {
            const req = mockRequest();
            req.params = {
                id: new mongoose.Types.ObjectId().toString()
            };
            req.body = {
                nome: 'Nome Atualizado'
            };
            const res = mockResponse();


            await expect(usuarioController.atualizar(req, res)).rejects.toThrow();
        });

        test('deve falhar ao tentar atualizar com ID inválido', async () => {
            const req = mockRequest();
            req.params = {
                id: 'id-invalido'
            };
            req.body = {
                nome: 'Nome Atualizado'
            };
            const res = mockResponse();


            await expect(usuarioController.atualizar(req, res)).rejects.toThrow();
        });
    });

    describe('Método deletar', () => {
        let usuarioExistente;

        beforeEach(async () => {

            usuarioExistente = await UsuarioModel.create({
                nome: 'Usuário para Deletar',
                email: 'deletar@teste.com',
                senha: await bcrypt.hash('Senha@123', 10)
            });
        });
        test('deve lidar com erro interno do serviço', async () => {

            const mockService = usuarioController.service;
            const originalDeletar = mockService.deletar;
            mockService.deletar = jest.fn().mockRejectedValue(new Error('Erro interno do serviço'));

            const req = mockRequest();
            req.params = {
                id: usuarioExistente._id.toString()
            };
            const res = mockResponse();


            await expect(usuarioController.deletar(req, res)).rejects.toThrow('Erro interno do serviço');


            mockService.deletar = originalDeletar;
        });

        test('deve deletar um usuário existente com sucesso', async () => {
            const req = mockRequest();
            req.params = {
                id: usuarioExistente._id.toString()
            };
            const res = mockResponse();

            await usuarioController.deletar(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();
            expect(res.data.message).toContain('excluído com sucesso');


            const usuarioDeletado = await UsuarioModel.findById(usuarioExistente._id);
            expect(usuarioDeletado).toBeNull();
        });

        test('deve falhar ao tentar deletar um usuário inexistente', async () => {
            const req = mockRequest();
            req.params = {
                id: new mongoose.Types.ObjectId().toString()
            };
            const res = mockResponse();


            await expect(usuarioController.deletar(req, res)).rejects.toThrow();
        });

        test('deve falhar ao tentar deletar sem fornecer ID', async () => {
            const req = mockRequest();
            const res = mockResponse();


            await expect(usuarioController.deletar(req, res)).rejects.toThrow(CustomError);
        });

        test('deve falhar ao tentar deletar com ID inválido', async () => {
            const req = mockRequest();
            req.params = {
                id: 'id-invalido'
            };
            const res = mockResponse();


            await expect(usuarioController.deletar(req, res)).rejects.toThrow();
        });

        test('deve lançar erro quando ID não é fornecido', async () => {
            const req = mockRequest();
            req.params = {};
            const res = mockResponse();

            try {
                await usuarioController.deletar(req, res);
                fail('Deveria ter lançado um erro');
            } catch (error) {
                expect(error).toBeInstanceOf(CustomError);
                expect(error.statusCode).toBe(400);
                expect(error.errorType).toBe('validationError');
                expect(error.field).toBe('id');
                expect(error.customMessage).toContain('ID do usuário é obrigatório');
            }
        });
    });
});