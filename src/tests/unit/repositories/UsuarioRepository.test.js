import mongoose from 'mongoose';
import {
    MongoMemoryServer
} from 'mongodb-memory-server';
import bcrypt from 'bcrypt';
import UsuarioRepository from '../../../repositories/UsuarioRepository.js';
import UsuarioModel from '../../../models/Usuario.js';
import CursoModel from '../../../models/Curso.js';
import UsuarioFilterBuilder from '../../../repositories/filters/UsuarioFilterBuilder.js';
import {
    CustomError
} from '../../../utils/helpers/index.js';

describe('UsuarioRepository', () => {
    let mongoServer;
    let usuarioRepository;

    const usuarioBase = {
        nome: 'Usuário Teste',
        email: 'usuario@teste.com',
        senha: 'Senha@123',
    };

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        if (!mongoose.models.Curso) {
            mongoose.model('Curso', CursoModel.schema);
        }
        usuarioRepository = new UsuarioRepository();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await UsuarioModel.deleteMany({});
        jest.clearAllMocks();
    });

    describe('Cadastro de usuário', () => {
        it('deve cadastrar usuário válido com senha criptografada', async () => {
            const senhaHash = await bcrypt.hash(usuarioBase.senha, 10);
            const usuario = await usuarioRepository.criar({
                ...usuarioBase,
                senha: senhaHash
            });
            expect(usuario).toBeDefined();
            expect(usuario._id).toBeDefined();
            expect(usuario.nome).toBe(usuarioBase.nome);
            expect(usuario.email).toBe(usuarioBase.email);
            expect(usuario.senha).not.toBe(usuarioBase.senha);
        });

        it('deve falhar ao cadastrar usuário sem nome', async () => {
            const dados = {
                ...usuarioBase
            };
            delete dados.nome;
            await expect(usuarioRepository.criar(dados)).rejects.toThrow();
        });
        it('deve falhar ao cadastrar usuário sem email', async () => {
            const dados = {
                ...usuarioBase
            };
            delete dados.email;
            await expect(usuarioRepository.criar(dados)).rejects.toThrow();
        });
        it('deve falhar ao cadastrar usuário sem senha', async () => {
            const dados = {
                ...usuarioBase
            };
            delete dados.senha;
            await expect(usuarioRepository.criar(dados)).rejects.toThrow();
        });
        it('não deve permitir e-mail duplicado', async () => {
            const senhaHash = await bcrypt.hash(usuarioBase.senha, 10);
            await usuarioRepository.criar({
                ...usuarioBase,
                senha: senhaHash
            });
            await expect(usuarioRepository.criar({
                ...usuarioBase,
                senha: senhaHash
            })).rejects.toThrow();
        });
        it('deve definir ativo como false por padrão', async () => {
            const senhaHash = await bcrypt.hash(usuarioBase.senha, 10);
            const usuario = await usuarioRepository.criar({
                ...usuarioBase,
                senha: senhaHash
            });
            expect(usuario.ativo).toBe(false);
        });
        it('deve permitir definir ativo como true', async () => {
            const senhaHash = await bcrypt.hash(usuarioBase.senha, 10);
            const usuario = await usuarioRepository.criar({
                ...usuarioBase,
                senha: senhaHash,
                ativo: true
            });
            expect(usuario.ativo).toBe(true);
        });
    });

    describe('Leitura e listagem', () => {
        beforeEach(async () => {
            await UsuarioModel.create([{
                    nome: 'João',
                    email: 'joao@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10),
                    ativo: true
                },
                {
                    nome: 'Maria',
                    email: 'maria@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10),
                    ativo: false
                },
                {
                    nome: 'Pedro',
                    email: 'pedro@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10),
                    ativo: true,
                    grupos: ['67607e1b123456789abcdef0']
                },
            ]);
        });
        it('deve retornar todos os usuários cadastrados', async () => {
            const req = {
                params: {},
                query: {}
            };
            const resultado = await usuarioRepository.listar(req);
            expect(resultado.docs.length).toBeGreaterThanOrEqual(3);
        });
        it('deve buscar usuário por id', async () => {
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
            expect(resultado._id.toString()).toBe(usuario._id.toString());
            expect(resultado.email).toBe('joao@teste.com');
        });
        it('deve lançar erro ao buscar usuário inexistente por id', async () => {
            const idFake = new mongoose.Types.ObjectId();
            const req = {
                params: {
                    id: idFake.toString()
                },
                query: {}
            };
            await expect(usuarioRepository.listar(req)).rejects.toThrow(CustomError);
        });
        it('deve filtrar usuários por nome', async () => {
            const req = {
                params: {},
                query: {
                    nome: 'Maria'
                }
            };
            const resultado = await usuarioRepository.listar(req);
            expect(resultado.docs.length).toBe(1);
            expect(resultado.docs[0].nome).toBe('Maria');
        });
        it('deve filtrar usuários por email', async () => {
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
        it('deve filtrar usuários por status ativo', async () => {
            const req = {
                params: {},
                query: {
                    ativo: 'true'
                }
            };
            const resultado = await usuarioRepository.listar(req);
            expect(resultado.docs.every(u => u.ativo === true)).toBe(true);
        });
        it('deve filtrar usuários por status inativo', async () => {
            const req = {
                params: {},
                query: {
                    ativo: 'false'
                }
            };
            const resultado = await usuarioRepository.listar(req);
            expect(resultado.docs.every(u => u.ativo === false)).toBe(true);
        });
        it('deve filtrar usuários por grupos (Administradores)', async () => {
            const GrupoModel = (await import('../../../models/Grupo.js')).default;

            const grupoAdmin = await GrupoModel.create({
                nome: 'Administradores',
                descricao: 'Grupo de administradores',
                ativo: true,
                permissoes: []
            });

            const usuarioAdmin = await UsuarioModel.create({
                nome: 'Admin User',
                email: 'admin@test.com',
                senha: 'senha123',
                ativo: true,
                grupos: [grupoAdmin._id]
            });

            const req = {
                params: {},
                query: {
                    grupos: 'Administradores'
                }
            };
            const resultado = await usuarioRepository.listar(req);
            expect(resultado.docs.length).toBeGreaterThan(0);
            expect(resultado.docs.some(user => user._id.toString() === usuarioAdmin._id.toString())).toBe(true);
        });
    });

    describe('Atualização de usuário', () => {
        let usuarioExistente;
        beforeEach(async () => {
            usuarioExistente = await UsuarioModel.create({
                nome: 'Atualizar',
                email: 'atualizar@teste.com',
                senha: await bcrypt.hash('Senha@123', 10),
                ativo: false
            });
        });
        it('deve atualizar nome do usuário', async () => {
            const atualizado = await usuarioRepository.atualizar(usuarioExistente._id, {
                nome: 'Novo Nome'
            });
            expect(atualizado.nome).toBe('Novo Nome');
        });
        it('não deve permitir atualizar email', async () => {
            const atualizado = await usuarioRepository.atualizar(usuarioExistente._id, {
                email: 'novo@email.com'
            });
            expect(atualizado.email).toBe('atualizar@teste.com');
        });
        it('não deve permitir atualizar senha diretamente', async () => {
            const usuarioOriginal = await UsuarioModel.findById(usuarioExistente._id).select('+senha');

            const atualizado = await usuarioRepository.atualizar(usuarioExistente._id, {
                senha: 'NovaSenha123'
            });

            const usuarioAposUpdate = await UsuarioModel.findById(usuarioExistente._id).select('+senha');

            expect(usuarioOriginal.senha).toBe(usuarioAposUpdate.senha);

            expect(await bcrypt.compare('NovaSenha123', usuarioAposUpdate.senha)).toBe(false);
        });
        it('deve lançar erro ao tentar atualizar usuário inexistente', async () => {
            const idFake = new mongoose.Types.ObjectId();
            await expect(usuarioRepository.atualizar(idFake, {
                nome: 'X'
            })).rejects.toThrow(CustomError);
        });
    });

    describe('Soft delete e restauração', () => {
        let usuarioExistente;
        beforeEach(async () => {
            usuarioExistente = await UsuarioModel.create({
                nome: 'Deletar',
                email: 'deletar@teste.com',
                senha: await bcrypt.hash('Senha@123', 10),
                ativo: true,
            });
        });
        it('deve desativar usuário (soft delete)', async () => {
            const deletado = await usuarioRepository.deletar(usuarioExistente._id);
            expect(deletado.ativo).toBe(false);
            const usuarioBanco = await UsuarioModel.findById(usuarioExistente._id);
            expect(usuarioBanco.ativo).toBe(false);
        });
        it('deve lançar erro ao tentar deletar usuário inexistente', async () => {
            const idFake = new mongoose.Types.ObjectId();
            await expect(usuarioRepository.deletar(idFake)).rejects.toThrow(CustomError);
        });
        it('deve restaurar usuário desativado', async () => {
            await usuarioRepository.deletar(usuarioExistente._id);
            const restaurado = await usuarioRepository.restaurar(usuarioExistente._id);
            expect(restaurado.ativo).toBe(true);
        });
        it('deve lançar erro ao tentar restaurar usuário inexistente', async () => {
            const idFake = new mongoose.Types.ObjectId();
            await expect(usuarioRepository.restaurar(idFake)).rejects.toThrow(CustomError);
        });
        it('deve remover fisicamente usuário', async () => {
            const removido = await usuarioRepository.deletarFisicamente(usuarioExistente._id);
            expect(removido._id.toString()).toBe(usuarioExistente._id.toString());
            const buscado = await UsuarioModel.findById(usuarioExistente._id);
            expect(buscado).toBeNull();
        });
        it('deve lançar erro ao tentar remover fisicamente usuário inexistente', async () => {
            const idFake = new mongoose.Types.ObjectId();
            await expect(usuarioRepository.deletarFisicamente(idFake)).rejects.toThrow(CustomError);
        });
    });

    describe('Relacionamento com cursos e progresso', () => {
        it('deve associar múltiplos cursos ao usuário', async () => {
            const curso1 = new mongoose.Types.ObjectId();
            const curso2 = new mongoose.Types.ObjectId();
            const usuario = await usuarioRepository.criar({
                nome: 'Com Cursos',
                email: 'comcursos@teste.com',
                senha: await bcrypt.hash('Senha@123', 10),
                cursosIds: [curso1, curso2],
            });
            expect(usuario.cursosIds.length).toBe(2);
            expect(usuario.cursosIds[0].toString()).toBe(curso1.toString());
            expect(usuario.cursosIds[1].toString()).toBe(curso2.toString());
        });
        it('deve registrar progresso em cursos', async () => {
            const curso1 = new mongoose.Types.ObjectId();
            const usuario = await usuarioRepository.criar({
                nome: 'Com Progresso',
                email: 'comprogresso@teste.com',
                senha: await bcrypt.hash('Senha@123', 10),
                progresso: [{
                    curso: curso1,
                    percentual_conclusao: '80'
                }],
            });
            expect(usuario.progresso.length).toBe(1);
            expect(usuario.progresso[0].curso.toString()).toBe(curso1.toString());
            expect(usuario.progresso[0].percentual_conclusao).toBe('80');
        });
        it('deve popular cursosIds e progresso.curso ao buscar usuário', async () => {
            const criadorId = new mongoose.Types.ObjectId();
            const curso1 = await CursoModel.create({
                _id: new mongoose.Types.ObjectId(),
                titulo: 'Curso Populado',
                cargaHorariaTotal: 10,
                status: 'ativo',
                criadoPorId: criadorId,
            });
            const usuario = await usuarioRepository.criar({
                nome: 'Populado',
                email: 'populado@teste.com',
                senha: await bcrypt.hash('Senha@123', 10),
                cursosIds: [curso1._id],
                progresso: [{
                    curso: curso1._id,
                    percentual_conclusao: 100
                }],
            });
            const req = {
                params: {
                    id: usuario._id.toString()
                },
                query: {}
            };
            const resultado = await usuarioRepository.listar(req);
            expect(resultado.cursosIds[0]._id.toString()).toBe(curso1._id.toString());
            expect(resultado.progresso[0].curso._id.toString()).toBe(curso1._id.toString());
        });
    });

    describe('Cobertura de branches e erros raros', () => {
        it('deve lançar erro se filterBuilder.build não for função', async () => {
            const originalBuild = UsuarioFilterBuilder.prototype.build;
            UsuarioFilterBuilder.prototype.build = 'não é uma função';

            const repo = new UsuarioRepository();
            const req = {
                params: {},
                query: {}
            };

            try {
                await expect(repo.listar(req)).rejects.toThrow(CustomError);
            } finally {
                UsuarioFilterBuilder.prototype.build = originalBuild;
            }
        });
    });

    describe('Busca por email', () => {
        beforeEach(async () => {
            await UsuarioModel.create({
                nome: 'Teste Email',
                email: 'teste@email.com',
                senha: await bcrypt.hash('Senha@123', 10),
            });
        });

        it('deve buscar usuário por email', async () => {
            const usuario = await usuarioRepository.buscarPorEmail('teste@email.com');
            expect(usuario).toBeDefined();
            expect(usuario.email).toBe('teste@email.com');
        });

        it('deve buscar usuário por email ignorando um ID específico', async () => {
            const usuarioExistente = await UsuarioModel.findOne({
                email: 'teste@email.com'
            });
            const usuario = await usuarioRepository.buscarPorEmail('teste@email.com', usuarioExistente._id);
            expect(usuario).toBeNull();
        });

        it('deve lançar erro quando usuário não encontrado e throwErrorIfNotFound é true', async () => {
            await expect(
                usuarioRepository.buscarPorEmail('naoexiste@email.com', null, true)
            ).rejects.toThrow(CustomError);
        });

        it('deve retornar null quando usuário não encontrado e throwErrorIfNotFound é false', async () => {
            const usuario = await usuarioRepository.buscarPorEmail('naoexiste@email.com', null, false);
            expect(usuario).toBeNull();
        });
    });

    describe('Ordenação e filtros especiais', () => {
        beforeEach(async () => {
            await UsuarioModel.create([{
                    nome: 'Alpha',
                    email: 'alpha@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10),
                    ativo: true
                },
                {
                    nome: 'Beta',
                    email: 'beta@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10),
                    ativo: true
                },
                {
                    nome: 'Charlie',
                    email: 'charlie@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10),
                    ativo: true
                },
            ]);
        });

        it('deve aplicar ordenação especial quando especificada', async () => {
            const req = {
                params: {},
                query: {
                    ordenarPor: 'nome',
                    direcao: 'desc'
                }
            };
            const resultado = await usuarioRepository.listar(req);
            expect(resultado.docs[0].nome).toBe('Charlie');
            expect(resultado.docs[1].nome).toBe('Beta');
            expect(resultado.docs[2].nome).toBe('Alpha');
        });
    });

    describe('Métodos especializados', () => {
        let cursoId;

        beforeEach(async () => {
            cursoId = new mongoose.Types.ObjectId();
            await UsuarioModel.create([{
                    nome: 'Usuario1',
                    email: 'usuario1@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10),
                    cursosIds: [cursoId],
                    progresso: [{
                        curso: cursoId,
                        percentual_conclusao: '50'
                    }]
                },
                {
                    nome: 'Usuario2',
                    email: 'usuario2@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10),
                    cursosIds: [cursoId],
                    progresso: [{
                        curso: cursoId,
                        percentual_conclusao: '20'
                    }]
                },
                {
                    nome: 'Usuario3',
                    email: 'usuario3@teste.com',
                    senha: await bcrypt.hash('Senha@123', 10),
                    cursosIds: [cursoId],
                    progresso: [{
                        curso: cursoId,
                        percentual_conclusao: '80'
                    }]
                }
            ]);
        });

        it('deve buscar usuários com progresso significativo', async () => {
            const usuarios = await usuarioRepository.buscarUsuariosComProgressoSignificativo(cursoId, 30);
            expect(usuarios.length).toBe(2);
            expect(usuarios.every(u => u.nome && u.email)).toBe(true);
        });

        it('deve buscar usuários com progresso significativo usando limite padrão', async () => {
            const usuarios = await usuarioRepository.buscarUsuariosComProgressoSignificativo(cursoId);
            expect(usuarios.length).toBe(2);
        });

        it('deve remover referências de curso dos usuários', async () => {
            const resultado = await usuarioRepository.removerReferenciaCurso(cursoId);

            expect(resultado.cursosRemovidos).toBe(3);
            expect(resultado.progressosRemovidos).toBe(3);

            const usuarios = await UsuarioModel.find({
                cursosIds: cursoId
            });
            expect(usuarios.length).toBe(0);

            const usuariosComProgresso = await UsuarioModel.find({
                'progresso.curso': cursoId
            });
            expect(usuariosComProgresso.length).toBe(0);
        });
    });

    describe('Cobertura extra UsuarioRepository', () => {
        let usuario;
        beforeEach(async () => {
            usuarioRepository = new UsuarioRepository();
            usuario = await UsuarioModel.create({
                nome: 'Cobertura',
                email: 'cobertura@teste.com',
                senha: await bcrypt.hash('Senha@123', 10),
                refreshtoken: 'refresh',
                accesstoken: 'access',
                grupos: [],
            });
        });

        it('buscarPorId deve retornar usuário com includeTokens e grupos', async () => {
            const result = await usuarioRepository.buscarPorId(usuario._id, {
                includeTokens: true,
                grupos: true
            });
            expect(result).toBeDefined();
            expect(result.refreshtoken).toBe('refresh');
            expect(result.accesstoken).toBe('access');
        });

        it('buscarPorId deve lançar erro se não encontrar', async () => {
            const idFake = new mongoose.Types.ObjectId();
            await expect(usuarioRepository.buscarPorId(idFake)).rejects.toThrow(CustomError);
        });

        it('armazenarTokens deve atualizar tokens', async () => {
            const result = await usuarioRepository.armazenarTokens(usuario._id, 'novoAccess', 'novoRefresh');
            expect(result.accesstoken).toBe('novoAccess');
            expect(result.refreshtoken).toBe('novoRefresh');
        });

        it('armazenarTokens deve lançar erro se usuário não existe', async () => {
            const idFake = new mongoose.Types.ObjectId();
            await expect(usuarioRepository.armazenarTokens(idFake, 'a', 'b')).rejects.toThrow(CustomError);
        });

        it('buscarPorCodigoRecuperacao deve retornar null se não existir', async () => {
            const result = await usuarioRepository.buscarPorCodigoRecuperacao('codigoInexistente');
            expect(result).toBeNull();
        });

        it('buscarPorTokenUnico deve retornar null se não existir', async () => {
            const result = await usuarioRepository.buscarPorTokenUnico('tokenInexistente');
            expect(result).toBeNull();
        });

        it('atualizarSenha deve atualizar senha e limpar tokens', async () => {
            const novaSenha = await bcrypt.hash('NovaSenha@123', 10);
            await usuarioRepository.atualizarSenha(usuario._id, novaSenha);
            const usuarioAtualizado = await UsuarioModel.findById(usuario._id).select('+senha');
            expect(usuarioAtualizado).toBeDefined();
            expect(await bcrypt.compare('NovaSenha@123', usuarioAtualizado.senha)).toBe(true);
            expect(usuarioAtualizado.tokenUnico === null || usuarioAtualizado.tokenUnico === undefined).toBe(true);
            expect(usuarioAtualizado.codigo_recupera_senha === null || usuarioAtualizado.codigo_recupera_senha === undefined).toBe(true);
        });

        it('atualizarSenha deve lançar erro se usuário não existe', async () => {
            const idFake = new mongoose.Types.ObjectId();
            const novaSenha = await bcrypt.hash('NovaSenha@123', 10);
            await expect(usuarioRepository.atualizarSenha(idFake, novaSenha)).rejects.toThrow(CustomError);
        });

        it('removeToken deve limpar tokens', async () => {
            const result = await usuarioRepository.removeToken(usuario._id);
            expect(result.accesstoken).toBeNull();
            expect(result.refreshtoken).toBeNull();
        });

        it('removeToken deve lançar erro se usuário não existe', async () => {
            const idFake = new mongoose.Types.ObjectId();
            await expect(usuarioRepository.removeToken(idFake)).rejects.toThrow(CustomError);
        });
    });
});