import mongoose from 'mongoose';
import {
    MongoMemoryServer
} from 'mongodb-memory-server';
import bcrypt from 'bcrypt';
import UsuarioRepository from '../../../repositories/UsuarioRepository.js';
import UsuarioModel from '../../../models/Usuario.js';
import UsuarioFilterBuilder from '../../../repositories/filters/UsuarioFilterBuilder.js';
import {
    CustomError
} from '../../../utils/helpers/index.js';

let mongoServer;
let usuarioRepository;

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

    usuarioRepository = new UsuarioRepository();
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

// Dados de exemplo para testes
const usuarioBase = {
    nome: 'Usuário Teste',
    email: 'usuario@teste.com',
    senha: 'Senha@123'
};

describe('UsuarioRepository', () => {
    // Teste de instância
    test('deve instanciar o repository corretamente', () => {
        const repository = new UsuarioRepository();
        expect(repository).toBeInstanceOf(UsuarioRepository);
        expect(repository.model).toBeDefined();
    });

    describe('Método buscarPorEmail', () => {
        test('deve retornar um usuário quando o email existir', async () => {
            // Criar um usuário de teste
            const senhaHash = await bcrypt.hash(usuarioBase.senha, 10);
            const usuarioCriado = await UsuarioModel.create({
                ...usuarioBase,
                senha: senhaHash
            });

            const resultado = await usuarioRepository.buscarPorEmail(usuarioBase.email);
            expect(resultado).toBeDefined();
            expect(resultado.email).toBe(usuarioBase.email);
        });

        test('deve retornar null quando o email não existir', async () => {
            const resultado = await usuarioRepository.buscarPorEmail('inexistente@teste.com');
            expect(resultado).toBeNull();
        });

        test('deve ignorar o usuário com ID fornecido', async () => {
            // Criar um usuário de teste
            const senhaHash = await bcrypt.hash(usuarioBase.senha, 10);
            const usuarioCriado = await UsuarioModel.create({
                ...usuarioBase,
                senha: senhaHash
            });

            // Buscar ignorando o próprio ID do usuário
            const resultado = await usuarioRepository.buscarPorEmail(usuarioBase.email, usuarioCriado._id);
            expect(resultado).toBeNull();
        });

        test('deve lançar erro quando email não existe e throwErrorIfNotFound é true', async () => {
            await expect(
                usuarioRepository.buscarPorEmail('inexistente@teste.com', null, true)
            ).rejects.toThrow(CustomError);

            try {
                await usuarioRepository.buscarPorEmail('inexistente@teste.com', null, true);
            } catch (error) {
                expect(error.statusCode).toBe(404);
                expect(error.errorType).toBe('resourceNotFound');
                expect(error.field).toBe('Usuário');
            }
        });
    });

    describe('Método buscarPorId', () => {
        test('deve retornar um usuário quando o ID existir', async () => {
            // Criar um usuário de teste
            const senhaHash = await bcrypt.hash(usuarioBase.senha, 10);
            const usuarioCriado = await UsuarioModel.create({
                ...usuarioBase,
                senha: senhaHash
            });

            const resultado = await usuarioRepository.buscarPorId(usuarioCriado._id);
            expect(resultado).toBeDefined();
            expect(resultado.email).toBe(usuarioBase.email);
            expect(resultado._id.toString()).toBe(usuarioCriado._id.toString());
        });

        test('deve lançar erro quando o ID não existir', async () => {
            const idInexistente = new mongoose.Types.ObjectId().toString();

            await expect(usuarioRepository.buscarPorId(idInexistente)).rejects.toThrow(CustomError);

            try {
                await usuarioRepository.buscarPorId(idInexistente);
            } catch (error) {
                expect(error.statusCode).toBe(404);
                expect(error.errorType).toBe('resourceNotFound');
                expect(error.field).toBe('Usuário');
            }
        });
    });

    describe('Método listar', () => {
        beforeEach(async () => { // Criar vários usuários para os testes de listagem
            const curso1Id = new mongoose.Types.ObjectId();
            const curso2Id = new mongoose.Types.ObjectId();
            const curso3Id = new mongoose.Types.ObjectId();

            await UsuarioModel.create([{
                    nome: 'João Silva',
                    email: 'joao@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10),
                    ativo: true,
                    cursosIds: [curso1Id, curso2Id],
                    progresso: [{
                            curso: curso1Id,
                            percentual_conclusao: '50'
                        },
                        {
                            curso: curso2Id,
                            percentual_conclusao: '75'
                        }
                    ]
                },
                {
                    nome: 'Maria Santos',
                    email: 'maria@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10),
                    ativo: false,
                    cursosIds: [curso3Id],
                    progresso: [{
                        curso: curso3Id,
                        percentual_conclusao: '30'
                    }]
                },
                {
                    nome: 'Pedro Alves',
                    email: 'pedro@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10),
                    ativo: true,
                    cursosIds: [],
                    progresso: []
                }
            ]);
        });

        test('deve retornar um usuário específico quando o ID é fornecido', async () => {
            // Buscar um usuário pelo ID
            const usuario = await UsuarioModel.findOne({
                email: 'joao@teste.com'
            });
            const req = {
                params: {
                    id: usuario._id.toString()
                },
                query: {}
            };

            const resultado = await usuarioRepository.listar(req);

            expect(resultado).toBeDefined();
            expect(resultado.email).toBe('joao@teste.com');
            expect(resultado.nome).toBe('João Silva');
            expect(resultado.totalCursos).toBe(2);
            expect(parseFloat(resultado.percentualMedio)).toBe(62.50);
        });

        test('deve lançar erro quando o ID fornecido não existir', async () => {
            const idInexistente = new mongoose.Types.ObjectId().toString();
            const req = {
                params: {
                    id: idInexistente
                },
                query: {}
            };

            await expect(usuarioRepository.listar(req)).rejects.toThrow(CustomError);

            try {
                await usuarioRepository.listar(req);
            } catch (error) {
                expect(error.statusCode).toBe(404);
                expect(error.errorType).toBe('resourceNotFound');
                expect(error.field).toBe('Usuário');
            }
        });

        test('deve listar todos os usuários quando nenhum filtro é fornecido', async () => {
            const req = {
                params: {},
                query: {}
            };

            const resultado = await usuarioRepository.listar(req);

            expect(resultado.docs).toBeDefined();
            expect(resultado.docs.length).toBe(3);
            expect(resultado.totalDocs).toBe(3);
        });

        test('deve filtrar usuários por nome corretamente', async () => {
            const req = {
                params: {},
                query: {
                    nome: 'Maria'
                }
            };

            const resultado = await usuarioRepository.listar(req);

            expect(resultado.docs.length).toBe(1);
            expect(resultado.docs[0].nome).toBe('Maria Santos');
        });

        test('deve filtrar usuários por email corretamente', async () => {
            const req = {
                params: {},
                query: {
                    email: 'pedro'
                }
            };

            const resultado = await usuarioRepository.listar(req);

            expect(resultado.docs.length).toBe(1);
            expect(resultado.docs[0].email).toBe('pedro@teste.com');
        });

        test('deve filtrar usuários por status ativo corretamente', async () => {
            const req = {
                params: {},
                query: {
                    ativo: 'true'
                }
            };

            const resultado = await usuarioRepository.listar(req);

            expect(resultado.docs.length).toBe(2);
            expect(resultado.docs[0].ativo).toBe(true);
            expect(resultado.docs[1].ativo).toBe(true);
        });

        test('deve aplicar paginação corretamente', async () => {
            // Adicionar mais usuários para teste de paginação
            const novosUsuarios = [];
            for (let i = 0; i < 5; i++) {
                novosUsuarios.push({
                    nome: `Usuário Extra ${i}`,
                    email: `extra${i}@teste.com`,
                    senha: await bcrypt.hash('Senha@123', 10),
                    ativo: true
                });
            }
            await UsuarioModel.create(novosUsuarios);

            // Página 1 com limite 3
            const req1 = {
                params: {},
                query: {
                    page: 1,
                    limite: 3
                }
            };
            const resultado1 = await usuarioRepository.listar(req1);

            expect(resultado1.docs.length).toBe(3);
            expect(resultado1.page).toBe(1);
            expect(resultado1.totalDocs).toBe(8);
            expect(resultado1.totalPages).toBe(3);

            // Página 2 com limite 3
            const req2 = {
                params: {},
                query: {
                    page: 2,
                    limite: 3
                }
            };
            const resultado2 = await usuarioRepository.listar(req2);

            expect(resultado2.docs.length).toBe(3);
            expect(resultado2.page).toBe(2);
        });
        test('deve limitar a quantidade máxima de resultados', async () => {
            // Adicionar alguns usuários para testar o limite - reduzido para evitar timeout
            const novosUsuarios = [];
            for (let i = 0; i < 20; i++) {
                novosUsuarios.push({
                    nome: `Usuário Limite ${i}`,
                    email: `limite${i}@teste.com`,
                    senha: await bcrypt.hash('Senha@123', 10),
                    ativo: true
                });
            }
            await UsuarioModel.create(novosUsuarios);

            // Tentar obter um limite acima do máximo permitido (100)
            const req = {
                params: {},
                query: {
                    limite: 200
                }
            };
            const resultado = await usuarioRepository.listar(req);

            // Como o número total de usuários é menor que 100, verificamos apenas
            // se o limite aplicado foi igual ou menor que 100
            expect(resultado.limit).toBeLessThanOrEqual(100);
        });

        test('deve enriquecer os dados de cada usuário com totalCursos e percentualMedio', async () => {
            const req = {
                params: {},
                query: {}
            };

            const resultado = await usuarioRepository.listar(req);

            // Verificar usuário com cursos
            const joao = resultado.docs.find(u => u.email === 'joao@teste.com');
            expect(joao.totalCursos).toBe(2);
            expect(parseFloat(joao.percentualMedio)).toBe(62.50);

            // Verificar usuário com 1 curso
            const maria = resultado.docs.find(u => u.email === 'maria@teste.com');
            expect(maria.totalCursos).toBe(1);
            expect(parseFloat(maria.percentualMedio)).toBe(30);

            // Verificar usuário sem cursos
            const pedro = resultado.docs.find(u => u.email === 'pedro@teste.com');
            expect(pedro.totalCursos).toBe(0);
            expect(parseFloat(pedro.percentualMedio)).toBe(0);
        });
    });

    describe('Método criar', () => {
        test('deve criar um usuário válido com sucesso', async () => {
            const dadosUsuario = {
                nome: 'Novo Usuário',
                email: 'novo@teste.com',
                senha: await bcrypt.hash('Senha@123', 10)
            };

            const resultado = await usuarioRepository.criar(dadosUsuario);

            expect(resultado).toBeDefined();
            expect(resultado._id).toBeDefined();
            expect(resultado.nome).toBe(dadosUsuario.nome);
            expect(resultado.email).toBe(dadosUsuario.email);

            // Verificar se foi salvo no banco
            const usuarioSalvo = await UsuarioModel.findById(resultado._id);
            expect(usuarioSalvo).not.toBeNull();
            expect(usuarioSalvo.nome).toBe(dadosUsuario.nome);
        });

        test('deve falhar ao criar um usuário com email duplicado', async () => {
            // Primeiro, criar um usuário
            await UsuarioModel.create({
                nome: 'Usuário Original',
                email: 'duplicado@teste.com',
                senha: await bcrypt.hash('Senha@123', 10)
            });

            // Tentar criar outro com o mesmo email
            const dadosUsuario = {
                nome: 'Usuário Duplicado',
                email: 'duplicado@teste.com',
                senha: await bcrypt.hash('Senha@123', 10)
            };

            await expect(usuarioRepository.criar(dadosUsuario)).rejects.toThrow();

            // Verificar que apenas um usuário com esse email existe
            const usuariosEncontrados = await UsuarioModel.find({
                email: 'duplicado@teste.com'
            });
            expect(usuariosEncontrados.length).toBe(1);
            expect(usuariosEncontrados[0].nome).toBe('Usuário Original');
        });

        test('deve definir os valores padrão para ehAdmin e ativo', async () => {
            const dadosUsuario = {
                nome: 'Usuário Padrões',
                email: 'padroes@teste.com',
                senha: await bcrypt.hash('Senha@123', 10)
            };

            const resultado = await usuarioRepository.criar(dadosUsuario);

            expect(resultado.ehAdmin).toBe(false);
            expect(resultado.ativo).toBe(false);
        });

        test('deve permitir definir valores personalizados para ehAdmin e ativo', async () => {
            const dadosUsuario = {
                nome: 'Usuário Admin',
                email: 'admin@teste.com',
                senha: await bcrypt.hash('Senha@123', 10),
                ehAdmin: true,
                ativo: true
            };

            const resultado = await usuarioRepository.criar(dadosUsuario);

            expect(resultado.ehAdmin).toBe(true);
            expect(resultado.ativo).toBe(true);
        });
    });

    describe('Método atualizar', () => {
        let usuarioExistente;

        beforeEach(async () => {
            // Criar um usuário para os testes de atualização
            usuarioExistente = await UsuarioModel.create({
                nome: 'Usuário para Atualizar',
                email: 'atualizar@teste.com',
                senha: await bcrypt.hash('Senha@123', 10),
                ativo: false
            });
        });

        test('deve atualizar o nome do usuário com sucesso', async () => {
            const resultado = await usuarioRepository.atualizar(
                usuarioExistente._id, {
                    nome: 'Nome Atualizado'
                }
            );

            expect(resultado).toBeDefined();
            expect(resultado.nome).toBe('Nome Atualizado');

            // Verificar no banco
            const usuarioAtualizado = await UsuarioModel.findById(usuarioExistente._id);
            expect(usuarioAtualizado.nome).toBe('Nome Atualizado');
        });

        test('deve atualizar o status ativo do usuário com sucesso', async () => {
            const resultado = await usuarioRepository.atualizar(
                usuarioExistente._id, {
                    ativo: true
                }
            );

            expect(resultado.ativo).toBe(true);

            // Verificar no banco
            const usuarioAtualizado = await UsuarioModel.findById(usuarioExistente._id);
            expect(usuarioAtualizado.ativo).toBe(true);
        });

        test('deve atualizar múltiplos campos do usuário com sucesso', async () => {
            const resultado = await usuarioRepository.atualizar(
                usuarioExistente._id, {
                    nome: 'Nome Novo',
                    ativo: true,
                    ehAdmin: true
                }
            );

            expect(resultado.nome).toBe('Nome Novo');
            expect(resultado.ativo).toBe(true);
            expect(resultado.ehAdmin).toBe(true);

            // Verificar no banco
            const usuarioAtualizado = await UsuarioModel.findById(usuarioExistente._id);
            expect(usuarioAtualizado.nome).toBe('Nome Novo');
            expect(usuarioAtualizado.ativo).toBe(true);
            expect(usuarioAtualizado.ehAdmin).toBe(true);
        });

        test('deve lançar erro ao tentar atualizar um usuário inexistente', async () => {
            const idInexistente = new mongoose.Types.ObjectId().toString();

            await expect(usuarioRepository.atualizar(idInexistente, {
                    nome: 'Nome Novo'
                }))
                .rejects.toThrow(CustomError);

            try {
                await usuarioRepository.atualizar(idInexistente, {
                    nome: 'Nome Novo'
                });
            } catch (error) {
                expect(error.statusCode).toBe(404);
                expect(error.errorType).toBe('resourceNotFound');
                expect(error.field).toBe('Usuário');
            }
        });
    });

    describe('Método deletar', () => {
        let usuarioExistente;

        beforeEach(async () => {
            // Criar um usuário para os testes de exclusão
            usuarioExistente = await UsuarioModel.create({
                nome: 'Usuário para Deletar',
                email: 'deletar@teste.com',
                senha: await bcrypt.hash('Senha@123', 10)
            });
        });

        test('deve deletar um usuário existente com sucesso', async () => {
            const resultado = await usuarioRepository.deletar(usuarioExistente._id);

            expect(resultado).toBeDefined();
            expect(resultado._id.toString()).toBe(usuarioExistente._id.toString());

            // Verificar se foi removido do banco
            const usuarioDeletado = await UsuarioModel.findById(usuarioExistente._id);
            expect(usuarioDeletado).toBeNull();
        });

        test('deve lançar erro ao tentar deletar um usuário inexistente', async () => {
            const idInexistente = new mongoose.Types.ObjectId().toString();

            await expect(usuarioRepository.deletar(idInexistente))
                .rejects.toThrow(CustomError);

            try {
                await usuarioRepository.deletar(idInexistente);
            } catch (error) {
                expect(error.statusCode).toBe(404);
                expect(error.errorType).toBe('resourceNotFound');
                expect(error.field).toBe('Usuário');
            }
        });
    });

    describe('Método enriquecerUsuario', () => {
        test('deve calcular totalCursos e percentualMedio corretamente para usuário com cursos', async () => {
            const curso1Id = new mongoose.Types.ObjectId();
            const curso2Id = new mongoose.Types.ObjectId();
            const curso3Id = new mongoose.Types.ObjectId();

            const usuario = await UsuarioModel.create({
                nome: 'Usuário com Cursos',
                email: 'cursos@teste.com',
                senha: await bcrypt.hash('Senha@123', 10),
                cursosIds: [curso1Id, curso2Id, curso3Id],
                progresso: [{
                        curso: curso1Id,
                        percentual_conclusao: '60'
                    },
                    {
                        curso: curso2Id,
                        percentual_conclusao: '80'
                    }
                ]
            });

            const resultado = usuarioRepository.enriquecerUsuario(usuario);

            expect(resultado.totalCursos).toBe(3);
            expect(resultado.percentualMedio).toBe('70.00');
        });

        test('deve calcular totalCursos e percentualMedio corretamente para usuário sem cursos', async () => {
            const usuario = await UsuarioModel.create({
                nome: 'Usuário sem Cursos',
                email: 'semcursos@teste.com',
                senha: await bcrypt.hash('Senha@123', 10),
                cursosIds: [],
                progresso: []
            });

            const resultado = usuarioRepository.enriquecerUsuario(usuario);

            expect(resultado.totalCursos).toBe(0);
            expect(resultado.percentualMedio).toBe('0.00');
        });
        test('deve calcular totalCursos e percentualMedio corretamente para usuário com cursos mas sem progresso', async () => {
            const curso1Id = new mongoose.Types.ObjectId();
            const curso2Id = new mongoose.Types.ObjectId();

            const usuario = await UsuarioModel.create({
                nome: 'Usuário com Cursos sem Progresso',
                email: 'cursossemprogresso@teste.com',
                senha: await bcrypt.hash('Senha@123', 10),
                cursosIds: [curso1Id, curso2Id],
                progresso: []
            });

            const resultado = usuarioRepository.enriquecerUsuario(usuario);

            expect(resultado.totalCursos).toBe(2);
            expect(resultado.percentualMedio).toBe('0.00');
        });
        test('deve calcular percentualMedio como 0 quando não houver progresso', () => {
            // Criar um mock de usuário sem progresso
            const mockUsuario = {
                _id: new mongoose.Types.ObjectId(),
                nome: 'Usuário Sem Progresso',
                email: 'semprogresso@teste.com',
                cursosIds: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
                progresso: [], // Array vazio
                toObject: function () {
                    return {
                        _id: this._id,
                        nome: this.nome,
                        email: this.email,
                        cursosIds: this.cursosIds,
                        progresso: this.progresso
                    };
                }
            };

            const resultado = usuarioRepository.enriquecerUsuario(mockUsuario);

            expect(resultado).toEqual(expect.objectContaining({
                totalCursos: 2,
                percentualMedio: '0.00'
            }));
        });

        test('deve calcular percentualMedio corretamente quando houver progresso', () => {
            // Criar um mock de usuário com progresso
            const mockUsuario = {
                _id: new mongoose.Types.ObjectId(),
                nome: 'Usuário Com Progresso',
                email: 'comprogresso@teste.com',
                cursosIds: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
                progresso: [{
                        curso_id: new mongoose.Types.ObjectId(),
                        percentual_conclusao: '25.00'
                    },
                    {
                        curso_id: new mongoose.Types.ObjectId(),
                        percentual_conclusao: '75.00'
                    }
                ],
                toObject: function () {
                    return {
                        _id: this._id,
                        nome: this.nome,
                        email: this.email,
                        cursosIds: this.cursosIds,
                        progresso: this.progresso
                    };
                }
            };

            const resultado = usuarioRepository.enriquecerUsuario(mockUsuario);

            expect(resultado).toEqual(expect.objectContaining({
                totalCursos: 2,
                percentualMedio: '50.00'
            }));
        });
    });

    describe('Simulação de erros de banco de dados', () => {
        test('deve lançar CustomError em caso de erro do banco de dados', async () => {
            await expect(usuarioRepository.simularErroBanco()).rejects.toThrow(CustomError);

            try {
                await usuarioRepository.simularErroBanco();
            } catch (error) {
                expect(error.statusCode).toBe(500);
                expect(error.errorType).toBe('databaseError');
                expect(error.field).toBe('Database');
            }
        });
    });
    describe('Métodos auxiliares e casos especiais', () => {
        describe('Tratamento de erro no método listar', () => {
            test('deve lançar erro quando filterBuilder.build não é função', async () => {
                // Preparar - criar mock inválido para filterBuilder
                const mockInvalidFilterBuilder = {
                    comNome: jest.fn().mockReturnThis(),
                    comEmail: jest.fn().mockReturnThis(),
                    comAtivo: jest.fn().mockReturnThis(),
                    // build não é uma função, é um objeto
                    build: {}
                };

                // Criar um spy para o método find
                jest.spyOn(usuarioRepository.model, 'find').mockImplementation(() => {
                    throw new CustomError({
                        statusCode: 500,
                        errorType: 'internalServerError',
                        field: 'Usuário',
                        customMessage: 'Erro interno do servidor'
                    });
                });

                // Substituir o filtro real pelo mock
                const originalFilterBuilder = usuarioRepository.usuarioFilterBuilder;
                usuarioRepository.usuarioFilterBuilder = mockInvalidFilterBuilder;

                // Verificar que um erro é lançado
                await expect(usuarioRepository.listar({
                    query: {}
                })).rejects.toThrow();

                // Restaurar o UsuarioFilterBuilder real e o mock do find
                usuarioRepository.usuarioFilterBuilder = originalFilterBuilder;
                jest.restoreAllMocks();
            });
        });

        describe('Método simularErroBanco', () => {
            test('deve lançar CustomError com detalhes específicos quando chamado', async () => {
                // Espionar o método findOne
                const findOneSpy = jest.spyOn(usuarioRepository.model, 'findOne');

                try {
                    await usuarioRepository.simularErroBanco();
                    fail('Deveria ter lançado um erro');
                } catch (error) {
                    expect(error).toBeInstanceOf(CustomError);
                    expect(error.statusCode).toBe(500);
                    expect(error.errorType).toBe('databaseError');
                    expect(error.field).toBe('Database');

                    // Verificar se o método findOne foi chamado com o ID inválido
                    expect(findOneSpy).toHaveBeenCalledWith({
                        _id: 'id-invalido-forcar-erro'
                    });
                }

                // Restaurar o método original
                findOneSpy.mockRestore();
            });
        });
    });
});