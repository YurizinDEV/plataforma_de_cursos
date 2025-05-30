import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import {
    MongoMemoryServer
} from 'mongodb-memory-server';
import Usuario from '../../../models/Usuario.js';

let mongoServer;

// Configuração do banco de dados em memória para testes
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    
    // Criar explicitamente o índice único para o email
    await mongoose.connection.collection('usuarios').createIndex({ email: 1 }, { unique: true });
});

// Limpar a coleção entre os testes
beforeEach(async () => {
    await Usuario.deleteMany({});
});

// Desconectar e parar o servidor após todos os testes
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Modelo de Usuário', () => {

    // Teste: Cadastro de usuário
    describe('Cadastro de usuário', () => {
        test('deve falhar ao salvar usuário sem nome', async () => {
            const usuarioSemNome = new Usuario({
                email: 'teste@email.com',
                senha: 'Senha@123'
            });

            await expect(usuarioSemNome.save()).rejects.toThrow();
        });

        test('deve falhar ao salvar usuário sem email', async () => {
            const usuarioSemEmail = new Usuario({
                nome: 'Usuário Teste',
                senha: 'Senha@123'
            });

            await expect(usuarioSemEmail.save()).rejects.toThrow();
        });

        test('deve falhar ao salvar usuário sem senha', async () => {
            const usuarioSemSenha = new Usuario({
                nome: 'Usuário Teste',
                email: 'teste@email.com'
            });

            await expect(usuarioSemSenha.save()).rejects.toThrow();
        });
    });

    // Teste: Cadastro válido
    test('deve salvar usuário com todos os campos obrigatórios', async () => {
        const dados = {
            nome: 'Usuário Teste',
            email: 'teste@email.com',
            senha: 'Senha@123'
        };

        const usuario = new Usuario(dados);
        const usuarioSalvo = await usuario.save();

        expect(usuarioSalvo.nome).toBe(dados.nome);
        expect(usuarioSalvo.email).toBe(dados.email);
        expect(usuarioSalvo.senha).toBe(dados.senha);
        expect(usuarioSalvo._id).toBeDefined();
        expect(usuarioSalvo.ehAdmin).toBe(false);
        expect(usuarioSalvo.ativo).toBe(false);
    });

    // Teste: E-mail único
    test('deve falhar ao cadastrar usuários com mesmo e-mail', async () => {
        // Cria o primeiro usuário
        const primeiroUsuario = new Usuario({
            nome: 'Primeiro Usuário',
            email: 'mesmo@email.com',
            senha: 'Senha@123'
        });

        await primeiroUsuario.save();

        // Tenta criar o segundo usuário com o mesmo email
        const segundoUsuario = new Usuario({
            nome: 'Segundo Usuário',
            email: 'mesmo@email.com',
            senha: 'Outra@123'
        });

        await expect(segundoUsuario.save()).rejects.toThrow();
    });

    // Teste: Valor padrão ehAdmin
    test('deve definir ehAdmin como false por padrão', async () => {
        const usuario = new Usuario({
            nome: 'Usuário Teste',
            email: 'teste@email.com',
            senha: 'Senha@123'
        });

        const usuarioSalvo = await usuario.save();
        expect(usuarioSalvo.ehAdmin).toBe(false);
    });

    // Teste: Valor padrão ativo
    test('deve definir ativo como false por padrão', async () => {
        const usuario = new Usuario({
            nome: 'Usuário Teste',
            email: 'teste@email.com',
            senha: 'Senha@123'
        });

        const usuarioSalvo = await usuario.save();
        expect(usuarioSalvo.ativo).toBe(false);
    });

    // Teste: Leitura de usuários
    test('deve retornar todos os usuários cadastrados', async () => {
        // Cria alguns usuários para testar
        await Usuario.create([{
                nome: 'Usuário 1',
                email: 'usuario1@email.com',
                senha: 'Senha@123'
            },
            {
                nome: 'Usuário 2',
                email: 'usuario2@email.com',
                senha: 'Senha@123'
            },
            {
                nome: 'Usuário 3',
                email: 'usuario3@email.com',
                senha: 'Senha@123'
            }
        ]);

        const usuarios = await Usuario.find();
        expect(usuarios).toHaveLength(3);
    });

    // Teste: Atualização de usuário
    test('deve atualizar informações de usuário', async () => {
        // Cria um usuário
        const usuario = await Usuario.create({
            nome: 'Nome Original',
            email: 'teste@email.com',
            senha: 'Senha@123'
        });

        // Atualiza o nome
        usuario.nome = 'Nome Atualizado';
        const usuarioAtualizado = await usuario.save();

        expect(usuarioAtualizado.nome).toBe('Nome Atualizado');
        expect(usuarioAtualizado.email).toBe('teste@email.com'); // Email permanece o mesmo
    });

    // Teste: Proibição de update email
    // Obs: Este teste é mais sobre regra de negócio do service, não do modelo
    test('deve permitir alteração de email no nível do modelo', async () => {
        const usuario = await Usuario.create({
            nome: 'Usuário Teste',
            email: 'original@email.com',
            senha: 'Senha@123'
        });

        usuario.email = 'novo@email.com';
        const usuarioAtualizado = await usuario.save();

        expect(usuarioAtualizado.email).toBe('novo@email.com');
    });

    // Teste: Proibição de update senha
    // Obs: Este teste é mais sobre regra de negócio do service, não do modelo
    test('deve permitir alteração de senha no nível do modelo', async () => {
        const usuario = await Usuario.create({
            nome: 'Usuário Teste',
            email: 'teste@email.com',
            senha: 'Senha@123'
        });

        usuario.senha = 'NovaSenha@123';
        const usuarioAtualizado = await usuario.save();

        expect(usuarioAtualizado.senha).toBe('NovaSenha@123');
    });

    // Teste: Remoção de usuário
    test('deve remover um usuário existente', async () => {
        // Cria um usuário
        const usuario = await Usuario.create({
            nome: 'Usuário para Deletar',
            email: 'delete@email.com',
            senha: 'Senha@123'
        });

        // Remove o usuário
        await Usuario.findByIdAndDelete(usuario._id);

        // Verifica se o usuário foi removido
        const usuarioRemovido = await Usuario.findById(usuario._id);
        expect(usuarioRemovido).toBeNull();
    });

    // Teste: Relacionamento com cursos
    test('deve associar cursos a um usuário', async () => {
        // Simula IDs de curso
        const cursoId1 = new mongoose.Types.ObjectId();
        const cursoId2 = new mongoose.Types.ObjectId();

        // Cria um usuário com cursos
        const usuario = await Usuario.create({
            nome: 'Usuário com Cursos',
            email: 'cursos@email.com',
            senha: 'Senha@123',
            cursosIds: [cursoId1, cursoId2]
        });

        // Verifica os cursos associados
        expect(usuario.cursosIds).toHaveLength(2);
        expect(usuario.cursosIds[0].toString()).toBe(cursoId1.toString());
        expect(usuario.cursosIds[1].toString()).toBe(cursoId2.toString());
    });

    // Teste: Progresso em cursos
    test('deve registrar progresso em cursos', async () => {
        // Simula ID de curso
        const cursoId = new mongoose.Types.ObjectId();

        // Cria um usuário com progresso
        const usuario = await Usuario.create({
            nome: 'Usuário com Progresso',
            email: 'progresso@email.com',
            senha: 'Senha@123',
            progresso: [{
                percentual_conclusao: '75',
                curso: cursoId
            }]
        });

        // Verifica o progresso
        expect(usuario.progresso).toHaveLength(1);
        expect(usuario.progresso[0].percentual_conclusao).toBe('75');
        expect(usuario.progresso[0].curso.toString()).toBe(cursoId.toString());
    });

    // Teste: Comprimento máximo do nome
    test('deve falhar se o nome exceder o limite máximo', async () => {
        // Cria um nome com mais de 100 caracteres
        const nomeGrande = 'a'.repeat(101);

        const usuarioNomeGrande = new Usuario({
            nome: nomeGrande,
            email: 'teste@email.com',
            senha: 'Senha@123'
        });

        await expect(usuarioNomeGrande.save()).rejects.toThrow();
    });    // Teste: Email mantém case original
    test('deve manter o case original do email ao salvar', async () => {
        const emailMisto = 'Teste@Email.com';

        const usuario = await Usuario.create({
            nome: 'Usuário Teste',
            email: emailMisto,
            senha: 'Senha@123'
        });

        expect(usuario.email).toBe(emailMisto);
    });

    // Teste: Manipulação do array de progresso
    test('deve permitir adicionar e atualizar progresso', async () => {
        // Cria usuário inicialmente sem progresso
        const usuario = await Usuario.create({
            nome: 'Usuário Progresso',
            email: 'atualizaprogresso@email.com',
            senha: 'Senha@123',
            progresso: []
        });

        // Adiciona progresso
        const cursoId = new mongoose.Types.ObjectId();
        usuario.progresso.push({
            percentual_conclusao: '30',
            curso: cursoId
        });

        await usuario.save();

        // Verifica adição
        const usuarioComProgresso = await Usuario.findById(usuario._id);
        expect(usuarioComProgresso.progresso).toHaveLength(1);

        // Atualiza progresso
        usuarioComProgresso.progresso[0].percentual_conclusao = '50';
        await usuarioComProgresso.save();

        // Verifica atualização
        const usuarioAtualizado = await Usuario.findById(usuario._id);
        expect(usuarioAtualizado.progresso[0].percentual_conclusao).toBe('50');
    });

    // Teste: Manipulação do array de cursosIds
    test('deve permitir adicionar e remover cursosIds', async () => {
        // Cria usuário sem cursos
        const usuario = await Usuario.create({
            nome: 'Usuário Cursos',
            email: 'cursos2@email.com',
            senha: 'Senha@123',
            cursosIds: []
        });

        // Adiciona cursos
        const cursoId1 = new mongoose.Types.ObjectId();
        usuario.cursosIds.push(cursoId1);
        await usuario.save();

        // Verifica adição
        const usuarioComUmCurso = await Usuario.findById(usuario._id);
        expect(usuarioComUmCurso.cursosIds).toHaveLength(1);

        // Adiciona outro curso
        const cursoId2 = new mongoose.Types.ObjectId();
        usuarioComUmCurso.cursosIds.push(cursoId2);
        await usuarioComUmCurso.save();

        // Verifica nova adição
        const usuarioComDoisCursos = await Usuario.findById(usuario._id);
        expect(usuarioComDoisCursos.cursosIds).toHaveLength(2);

        // Remove um curso
        usuarioComDoisCursos.cursosIds.pull(cursoId1);
        await usuarioComDoisCursos.save();

        // Verifica remoção
        const usuarioComUmCursoAposRemocao = await Usuario.findById(usuario._id);
        expect(usuarioComUmCursoAposRemocao.cursosIds).toHaveLength(1);
        expect(usuarioComUmCursoAposRemocao.cursosIds[0].toString()).toBe(cursoId2.toString());
    });

    // Teste: Valor Padrão de Timestamps
    test('deve criar campos timestamp automaticamente', async () => {
        const usuario = await Usuario.create({
            nome: 'Usuário Timestamps',
            email: 'timestamps@email.com',
            senha: 'Senha@123'
        });

        expect(usuario.createdAt).toBeDefined();
        expect(usuario.updatedAt).toBeDefined();
    });

    // Teste: Verificação de tipos dos campos
    test('deve manter os tipos corretos para cada campo', async () => {
        const cursoId = new mongoose.Types.ObjectId();
        const usuario = await Usuario.create({
            nome: 'Usuário Tipos',
            email: 'tipos@email.com',
            senha: 'Senha@123',
            ehAdmin: true,
            ativo: true,
            progresso: [{
                percentual_conclusao: '100',
                curso: cursoId
            }],
            cursosIds: [cursoId]
        });

        expect(typeof usuario.nome).toBe('string');
        expect(typeof usuario.senha).toBe('string');
        expect(typeof usuario.email).toBe('string');
        expect(typeof usuario.ehAdmin).toBe('boolean');
        expect(typeof usuario.ativo).toBe('boolean');
        expect(Array.isArray(usuario.progresso)).toBe(true);
        expect(Array.isArray(usuario.cursosIds)).toBe(true);
        expect(usuario.cursosIds[0] instanceof mongoose.Types.ObjectId).toBe(true);
        expect(usuario.progresso[0].curso instanceof mongoose.Types.ObjectId).toBe(true);
    });
});