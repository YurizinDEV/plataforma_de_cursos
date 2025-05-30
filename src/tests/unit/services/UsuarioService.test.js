import mongoose from 'mongoose';
import {
    MongoMemoryServer
} from 'mongodb-memory-server';
import bcrypt from 'bcrypt';
import UsuarioService from '../../../services/UsuarioService.js';
import UsuarioModel from '../../../models/Usuario.js';
import {
    CustomError
} from '../../../utils/helpers/index.js';

let mongoServer;
let usuarioService;

// Configuração do banco de dados em memória para testes
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Criar explicitamente o índice único para o email
    await mongoose.connection.collection('usuarios').createIndex({
        email: 1
    }, {
        unique: true
    });

    usuarioService = new UsuarioService();
});

// Limpar a coleção entre os testes
beforeEach(async () => {
    await UsuarioModel.deleteMany({});
    jest.clearAllMocks();
});

// Desconectar e parar o servidor após todos os testes
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Dados de teste
const usuarioValido = {
    nome: 'Usuário Teste',
    email: 'usuario@teste.com',
    senha: 'Senha@123'
};

describe('UsuarioService', () => {
    // Teste de propriedades e instância
    test('deve instanciar o service corretamente com repository', () => {
        const service = new UsuarioService();
        expect(service).toBeInstanceOf(UsuarioService);
        expect(service.repository).toBeDefined();
    });

    describe('Método listar', () => {
        test('deve retornar todos os usuários quando não há filtros', async () => {
            // Criar alguns usuários de teste
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

            const req = {
                params: {},
                query: {}
            };
            const resultado = await usuarioService.listar(req);

            // Verifica se o resultado é paginado e contém os dois usuários
            expect(resultado.docs).toBeDefined();
            expect(resultado.docs.length).toBe(2);
            expect(resultado.totalDocs).toBe(2);
        });
        test('deve filtrar usuários por nome corretamente', async () => {
            // Criar alguns usuários de teste
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

            const req = {
                params: {},
                query: {
                    nome: 'João'
                }
            };
            const resultado = await usuarioService.listar(req);

            // Verifica se filtrou corretamente
            expect(resultado.docs.length).toBe(1);
            expect(resultado.docs[0].nome).toContain('João');
        });
        test('deve filtrar usuários por email corretamente', async () => {
            // Criar alguns usuários de teste
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

            const req = {
                params: {},
                query: {
                    email: 'maria@teste.com'
                }
            };
            const resultado = await usuarioService.listar(req);

            expect(resultado.docs.length).toBe(1);
            expect(resultado.docs[0].email).toBe('maria@teste.com');
        });
        test('deve filtrar usuários por status ativo corretamente', async () => {
            // Criar alguns usuários de teste
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
            const req = {
                params: {},
                query: {
                    ativo: 'true'
                }
            };
            const resultado = await usuarioService.listar(req);

            expect(resultado.docs.length).toBe(1);
            expect(resultado.docs[0].ativo).toBe(true);
        });
        test('deve buscar usuário por ID corretamente', async () => {
            // Criar um usuário de teste
            const usuario = await UsuarioModel.create({
                nome: 'Usuário Teste',
                email: 'usuario@teste.com',
                senha: await bcrypt.hash('Senha@123', 10)
            });

            const req = {
                params: {
                    id: usuario._id.toString()
                },
                query: {}
            };
            const resultado = await usuarioService.listar(req);

            expect(resultado._id.toString()).toBe(usuario._id.toString());
            expect(resultado.nome).toBe(usuario.nome);
            expect(resultado.email).toBe(usuario.email);
        });
    });

    describe('Método criar', () => {
        test('deve criar um usuário válido com sucesso', async () => {
            const usuarioUnico = {
                nome: 'Usuário Único',
                email: 'usuario.unico@teste.com',
                senha: 'Senha@123'
            };

            const resultado = await usuarioService.criar(usuarioUnico);

            // Verifica se o usuário foi salvo corretamente
            expect(resultado).toBeDefined();
            expect(resultado._id).toBeDefined();
            expect(resultado.nome).toBe(usuarioUnico.nome);
            expect(resultado.email).toBe(usuarioUnico.email);

            // Verifica se o usuário foi salvo no banco
            const usuarioSalvo = await UsuarioModel.findOne({
                email: usuarioUnico.email
            });
            expect(usuarioSalvo).not.toBeNull();
            expect(usuarioSalvo.nome).toBe(usuarioUnico.nome);
            // Verificamos apenas que alguma senha foi salva
            expect(usuarioSalvo.senha).toBeDefined();
            expect(usuarioSalvo.senha.length).toBeGreaterThan(0);
        });

        test('deve criar usuário com valores padrão para ehAdmin e ativo', async () => {
            const resultado = await usuarioService.criar(usuarioValido);

            expect(resultado.ehAdmin).toBe(false);
            expect(resultado.ativo).toBe(false);

            // Verifica no banco
            const usuarioSalvo = await UsuarioModel.findOne({
                email: usuarioValido.email
            });
            expect(usuarioSalvo.ehAdmin).toBe(false);
            expect(usuarioSalvo.ativo).toBe(false);
        });

        test('deve criar usuário com valores personalizados para ehAdmin e ativo', async () => {
            const usuarioAdmin = {
                ...usuarioValido,
                email: 'admin@teste.com',
                ehAdmin: true,
                ativo: true
            };

            const resultado = await usuarioService.criar(usuarioAdmin);

            expect(resultado.ehAdmin).toBe(true);
            expect(resultado.ativo).toBe(true);

            // Verifica no banco
            const usuarioSalvo = await UsuarioModel.findOne({
                email: 'admin@teste.com'
            });
            expect(usuarioSalvo.ehAdmin).toBe(true);
            expect(usuarioSalvo.ativo).toBe(true);
        });

        test('deve falhar ao criar usuário com email já existente', async () => {
            // Primeiro, cria um usuário
            await UsuarioModel.create({
                nome: 'Usuário Existente',
                email: usuarioValido.email,
                senha: await bcrypt.hash('Senha@123', 10)
            });

            // Tenta criar outro usuário com o mesmo email
            await expect(usuarioService.criar(usuarioValido)).rejects.toThrow(CustomError);

            // Verifica se a exceção contém os detalhes corretos
            try {
                await usuarioService.criar(usuarioValido);
            } catch (error) {
                expect(error.statusCode).toBe(400);
                expect(error.errorType).toBe('validationError');
                expect(error.field).toBe('email');
                expect(error.customMessage).toContain('Email já está em uso');
            }
        });

        test('deve lidar com erro na criptografia da senha', async () => {
            // Mock do bcrypt para simular erro
            const mockHash = jest.spyOn(bcrypt, 'hash');
            mockHash.mockImplementationOnce(() => {
                throw new Error('Erro ao criptografar senha');
            });

            await expect(usuarioService.criar(usuarioValido)).rejects.toThrow('Erro ao criptografar senha');

            // Restaura o mock
            mockHash.mockRestore();
        });

        test('deve pular o hash da senha quando senha não for fornecida', async () => {
            // Mock da função validateEmail
            const validateEmailSpy = jest.spyOn(usuarioService, 'validateEmail')
                .mockImplementation(() => Promise.resolve());

            // Mock do bcrypt.hash para verificar que não foi chamado
            const bcryptHashSpy = jest.spyOn(bcrypt, 'hash');

            // Mock do repository.criar
            const criarSpy = jest.spyOn(usuarioService.repository, 'criar')
                .mockImplementation((dados) => Promise.resolve({
                    ...dados,
                    _id: new mongoose.Types.ObjectId(),
                    toObject: () => ({
                        ...dados
                    })
                }));

            const dadosUsuarioSemSenha = {
                nome: 'Usuário Sem Senha',
                email: 'semusuario@teste.com'
                // Sem senha
            };

            await usuarioService.criar(dadosUsuarioSemSenha);

            expect(bcryptHashSpy).not.toHaveBeenCalled();
            expect(criarSpy).toHaveBeenCalledWith(dadosUsuarioSemSenha);

            validateEmailSpy.mockRestore();
            bcryptHashSpy.mockRestore();
            criarSpy.mockRestore();
        });
        test('deve aplicar hash na senha quando senha for fornecida', async () => {
            // Mock da função validateEmail
            const validateEmailSpy = jest.spyOn(usuarioService, 'validateEmail')
                .mockImplementation(() => Promise.resolve());

            // Mock do bcrypt.hash
            const hashMock = 'hash-da-senha';
            const bcryptHashSpy = jest.spyOn(bcrypt, 'hash')
                .mockResolvedValue(hashMock);

            // Mock do repository.criar
            const criarSpy = jest.spyOn(usuarioService.repository, 'criar')
                .mockImplementation((dados) => Promise.resolve({
                    ...dados,
                    _id: new mongoose.Types.ObjectId(),
                    toObject: () => ({
                        ...dados
                    })
                }));

            const dadosUsuarioComSenha = {
                nome: 'Usuário Com Senha',
                email: 'comusuario@teste.com',
                senha: 'Senha@123'
            };

            await usuarioService.criar(dadosUsuarioComSenha);

            // Verifica que o hash foi aplicado com os parâmetros corretos
            expect(bcryptHashSpy).toHaveBeenCalledWith('Senha@123', 10);

            // Verifica que os dados foram enviados para o repositório com a senha hashada
            expect(criarSpy).toHaveBeenCalledWith({
                nome: 'Usuário Com Senha',
                email: 'comusuario@teste.com',
                senha: hashMock
            });

            validateEmailSpy.mockRestore();
            bcryptHashSpy.mockRestore();
            criarSpy.mockRestore();
        });
    });

    describe('Método atualizar', () => {
        let usuarioExistente;

        beforeEach(async () => {
            // Cria um usuário para os testes de atualização
            usuarioExistente = await UsuarioModel.create({
                nome: 'Usuário para Atualizar',
                email: 'atualizar@teste.com',
                senha: await bcrypt.hash('Senha@123', 10),
                ativo: false
            });
        });

        test('deve atualizar o nome do usuário com sucesso', async () => {
            const resultado = await usuarioService.atualizar(
                usuarioExistente._id.toString(), {
                    nome: 'Nome Atualizado'
                }
            );

            expect(resultado).toBeDefined();
            expect(resultado.nome).toBe('Nome Atualizado');
            expect(resultado.email).toBe(usuarioExistente.email);

            // Verifica se o usuário foi atualizado no banco
            const usuarioAtualizado = await UsuarioModel.findById(usuarioExistente._id);
            expect(usuarioAtualizado.nome).toBe('Nome Atualizado');
        });

        test('deve atualizar o status ativo do usuário com sucesso', async () => {
            const resultado = await usuarioService.atualizar(
                usuarioExistente._id.toString(), {
                    ativo: true
                }
            );

            expect(resultado.ativo).toBe(true);

            // Verifica se o usuário foi atualizado no banco
            const usuarioAtualizado = await UsuarioModel.findById(usuarioExistente._id);
            expect(usuarioAtualizado.ativo).toBe(true);
        });

        test('não deve alterar o email mesmo se fornecido na atualização', async () => {
            const resultado = await usuarioService.atualizar(
                usuarioExistente._id.toString(), {
                    nome: 'Nome Atualizado',
                    email: 'novo@email.com'
                }
            );

            expect(resultado.nome).toBe('Nome Atualizado');
            expect(resultado.email).toBe(usuarioExistente.email);

            // Verifica se o usuário foi atualizado no banco, mas o email permanece o original
            const usuarioAtualizado = await UsuarioModel.findById(usuarioExistente._id);
            expect(usuarioAtualizado.nome).toBe('Nome Atualizado');
            expect(usuarioAtualizado.email).toBe(usuarioExistente.email);
        });

        test('não deve alterar a senha mesmo se fornecida na atualização', async () => {
            const senhaOriginal = usuarioExistente.senha;

            const resultado = await usuarioService.atualizar(
                usuarioExistente._id.toString(), {
                    senha: 'NovaSenha@123'
                }
            );

            // Verifica se o usuário foi atualizado no banco, mas a senha permanece a original
            const usuarioAtualizado = await UsuarioModel.findById(usuarioExistente._id);
            expect(usuarioAtualizado.senha).toBe(senhaOriginal);
        });

        test('deve falhar ao tentar atualizar um usuário inexistente', async () => {
            const idInexistente = new mongoose.Types.ObjectId().toString();

            // Tenta atualizar um usuário que não existe
            await expect(usuarioService.atualizar(idInexistente, {
                    nome: 'Nome Atualizado'
                }))
                .rejects.toThrow(CustomError);

            // Verifica se a exceção contém os detalhes corretos
            try {
                await usuarioService.atualizar(idInexistente, {
                    nome: 'Nome Atualizado'
                });
            } catch (error) {
                expect(error.statusCode).toBe(404);
                expect(error.errorType).toBe('resourceNotFound');
                expect(error.field).toBe('Usuário');
            }
        });

        test('deve remover campos email e senha dos dados antes de atualizar', async () => {
            // Mock do repository para verificar os dados enviados
            const mockAtualizar = jest.spyOn(usuarioService.repository, 'atualizar');
            mockAtualizar.mockImplementationOnce((id, dados) => {
                expect(dados).not.toHaveProperty('email');
                expect(dados).not.toHaveProperty('senha');
                return usuarioExistente;
            });

            await usuarioService.atualizar(
                usuarioExistente._id.toString(), {
                    nome: 'Nome Atualizado',
                    email: 'novo@email.com',
                    senha: 'NovaSenha@123'
                }
            );

            expect(mockAtualizar).toHaveBeenCalled();

            // Restaura o mock
            mockAtualizar.mockRestore();
        });
    });

    describe('Método deletar', () => {
        let usuarioExistente;

        beforeEach(async () => {
            // Cria um usuário para os testes de exclusão
            usuarioExistente = await UsuarioModel.create({
                nome: 'Usuário para Deletar',
                email: 'deletar@teste.com',
                senha: await bcrypt.hash('Senha@123', 10)
            });
        });

        test('deve deletar um usuário existente com sucesso', async () => {
            const resultado = await usuarioService.deletar(usuarioExistente._id.toString());

            expect(resultado).toBeDefined();
            expect(resultado._id.toString()).toBe(usuarioExistente._id.toString());

            // Verifica se o usuário foi removido do banco
            const usuarioDeletado = await UsuarioModel.findById(usuarioExistente._id);
            expect(usuarioDeletado).toBeNull();
        });

        test('deve falhar ao tentar deletar um usuário inexistente', async () => {
            const idInexistente = new mongoose.Types.ObjectId().toString();

            // Tenta deletar um usuário que não existe
            await expect(usuarioService.deletar(idInexistente))
                .rejects.toThrow(CustomError);

            // Verifica se a exceção contém os detalhes corretos
            try {
                await usuarioService.deletar(idInexistente);
            } catch (error) {
                expect(error.statusCode).toBe(404);
                expect(error.errorType).toBe('resourceNotFound');
                expect(error.field).toBe('Usuário');
            }
        });
    });
    describe('Métodos auxiliares', () => {
        describe('validateEmail', () => {
            test('deve validar email único com sucesso', async () => {
                await expect(usuarioService.validateEmail('email_novo@teste.com'))
                    .resolves.not.toThrow();
            });

            test('deve rejeitar email duplicado', async () => {
                const buscarPorEmailSpy = jest.spyOn(usuarioService.repository, 'buscarPorEmail')
                    .mockResolvedValue({
                        _id: new mongoose.Types.ObjectId(),
                        email: 'email_existente@teste.com'
                    });

                await expect(usuarioService.validateEmail('email_existente@teste.com'))
                    .rejects.toThrow(CustomError);

                expect(buscarPorEmailSpy).toHaveBeenCalledWith('email_existente@teste.com', null);
                buscarPorEmailSpy.mockRestore();
            });

            test('deve permitir validar email para o próprio usuário (update)', async () => {
                const usuario = await UsuarioModel.create({
                    nome: 'Usuário Existente',
                    email: 'email_atual@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10)
                });

                await expect(usuarioService.validateEmail('email_atual@teste.com', usuario._id))
                    .resolves.not.toThrow();
            });
        });

        describe('ensureUserExists', () => {
            test('deve encontrar usuário existente', async () => {
                const usuario = await UsuarioModel.create({
                    nome: 'Usuário Existente',
                    email: 'usuario@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10)
                });

                const resultado = await usuarioService.ensureUserExists(usuario._id);
                expect(resultado).toBeDefined();
                expect(resultado._id.toString()).toBe(usuario._id.toString());
            });

            test('deve rejeitar ID inexistente', async () => {
                const idInexistente = new mongoose.Types.ObjectId().toString();

                await expect(usuarioService.ensureUserExists(idInexistente))
                    .rejects.toThrow(CustomError);

                try {
                    await usuarioService.ensureUserExists(idInexistente);
                } catch (error) {
                    expect(error.statusCode).toBe(404);
                    expect(error.errorType).toBe('resourceNotFound');
                    expect(error.field).toBe('Usuário');
                }
            });

            test('deve lançar erro 404 quando repository.buscarPorId retornar null', async () => {
                const idUsuario = new mongoose.Types.ObjectId().toString();
                const originalBuscarPorId = usuarioService.repository.buscarPorId;
                usuarioService.repository.buscarPorId = jest.fn().mockResolvedValue(null);

                try {
                    await usuarioService.ensureUserExists(idUsuario);
                    fail('Deveria ter lançado um erro');
                } catch (error) {
                    expect(error).toBeInstanceOf(CustomError);
                    expect(error.statusCode).toBe(404);
                    expect(error.errorType).toBe('resourceNotFound');
                    expect(error.field).toBe('Usuário');
                    expect(error.customMessage).toContain('Usuário não encontrado');
                }

                usuarioService.repository.buscarPorId = originalBuscarPorId;
            });
        });
    });
});