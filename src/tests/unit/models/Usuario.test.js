import {
    jest
} from '@jest/globals';
import mongoose from 'mongoose';
import {
    MongoMemoryServer
} from 'mongodb-memory-server';
import Usuario from '../../../models/Usuario.js';

let mongoServer;


beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);


    await mongoose.connection.collection('usuarios').createIndex({
        email: 1
    }, {
        unique: true
    });
});


beforeEach(async () => {
    await Usuario.deleteMany({});
});


afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Modelo de Usuário', () => {


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
        expect(usuarioSalvo.ativo).toBe(false);
    });


    test('deve falhar ao cadastrar usuários com mesmo e-mail', async () => {

        const primeiroUsuario = new Usuario({
            nome: 'Primeiro Usuário',
            email: 'mesmo@email.com',
            senha: 'Senha@123'
        });

        await primeiroUsuario.save();


        const segundoUsuario = new Usuario({
            nome: 'Segundo Usuário',
            email: 'mesmo@email.com',
            senha: 'Outra@123'
        });

        await expect(segundoUsuario.save()).rejects.toThrow();
    });


    test('deve definir ativo como false por padrão', async () => {
        const usuario = new Usuario({
            nome: 'Usuário Teste',
            email: 'teste@email.com',
            senha: 'Senha@123'
        });

        const usuarioSalvo = await usuario.save();
        expect(usuarioSalvo.ativo).toBe(false);
    });


    test('deve definir ativo como false por padrão', async () => {
        const usuario = new Usuario({
            nome: 'Usuário Teste',
            email: 'teste@email.com',
            senha: 'Senha@123'
        });

        const usuarioSalvo = await usuario.save();
        expect(usuarioSalvo.ativo).toBe(false);
    });


    test('deve retornar todos os usuários cadastrados', async () => {

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


    test('deve atualizar informações de usuário', async () => {

        const usuario = await Usuario.create({
            nome: 'Nome Original',
            email: 'teste@email.com',
            senha: 'Senha@123'
        });


        usuario.nome = 'Nome Atualizado';
        const usuarioAtualizado = await usuario.save();

        expect(usuarioAtualizado.nome).toBe('Nome Atualizado');
        expect(usuarioAtualizado.email).toBe('teste@email.com');
    });



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


    test('deve remover um usuário existente', async () => {

        const usuario = await Usuario.create({
            nome: 'Usuário para Deletar',
            email: 'delete@email.com',
            senha: 'Senha@123'
        });


        await Usuario.findByIdAndDelete(usuario._id);


        const usuarioRemovido = await Usuario.findById(usuario._id);
        expect(usuarioRemovido).toBeNull();
    });


    test('deve associar cursos a um usuário', async () => {

        const cursoId1 = new mongoose.Types.ObjectId();
        const cursoId2 = new mongoose.Types.ObjectId();


        const usuario = await Usuario.create({
            nome: 'Usuário com Cursos',
            email: 'cursos@email.com',
            senha: 'Senha@123',
            cursosIds: [cursoId1, cursoId2]
        });


        expect(usuario.cursosIds).toHaveLength(2);
        expect(usuario.cursosIds[0].toString()).toBe(cursoId1.toString());
        expect(usuario.cursosIds[1].toString()).toBe(cursoId2.toString());
    });


    test('deve registrar progresso em cursos', async () => {

        const cursoId = new mongoose.Types.ObjectId();


        const usuario = await Usuario.create({
            nome: 'Usuário com Progresso',
            email: 'progresso@email.com',
            senha: 'Senha@123',
            progresso: [{
                percentual_conclusao: '75',
                curso: cursoId
            }]
        });


        expect(usuario.progresso).toHaveLength(1);
        expect(usuario.progresso[0].percentual_conclusao).toBe('75');
        expect(usuario.progresso[0].curso.toString()).toBe(cursoId.toString());
    });


    test('deve falhar se o nome exceder o limite máximo', async () => {

        const nomeGrande = 'a'.repeat(101);

        const usuarioNomeGrande = new Usuario({
            nome: nomeGrande,
            email: 'teste@email.com',
            senha: 'Senha@123'
        });

        await expect(usuarioNomeGrande.save()).rejects.toThrow();
    });
    test('deve manter o case original do email ao salvar', async () => {
        const emailMisto = 'Teste@Email.com';

        const usuario = await Usuario.create({
            nome: 'Usuário Teste',
            email: emailMisto,
            senha: 'Senha@123'
        });

        expect(usuario.email).toBe(emailMisto);
    });


    test('deve permitir adicionar e atualizar progresso', async () => {

        const usuario = await Usuario.create({
            nome: 'Usuário Progresso',
            email: 'atualizaprogresso@email.com',
            senha: 'Senha@123',
            progresso: []
        });


        const cursoId = new mongoose.Types.ObjectId();
        usuario.progresso.push({
            percentual_conclusao: '30',
            curso: cursoId
        });

        await usuario.save();


        const usuarioComProgresso = await Usuario.findById(usuario._id);
        expect(usuarioComProgresso.progresso).toHaveLength(1);


        usuarioComProgresso.progresso[0].percentual_conclusao = '50';
        await usuarioComProgresso.save();


        const usuarioAtualizado = await Usuario.findById(usuario._id);
        expect(usuarioAtualizado.progresso[0].percentual_conclusao).toBe('50');
    });


    test('deve permitir adicionar e remover cursosIds', async () => {

        const usuario = await Usuario.create({
            nome: 'Usuário Cursos',
            email: 'cursos2@email.com',
            senha: 'Senha@123',
            cursosIds: []
        });


        const cursoId1 = new mongoose.Types.ObjectId();
        usuario.cursosIds.push(cursoId1);
        await usuario.save();


        const usuarioComUmCurso = await Usuario.findById(usuario._id);
        expect(usuarioComUmCurso.cursosIds).toHaveLength(1);


        const cursoId2 = new mongoose.Types.ObjectId();
        usuarioComUmCurso.cursosIds.push(cursoId2);
        await usuarioComUmCurso.save();


        const usuarioComDoisCursos = await Usuario.findById(usuario._id);
        expect(usuarioComDoisCursos.cursosIds).toHaveLength(2);


        usuarioComDoisCursos.cursosIds.pull(cursoId1);
        await usuarioComDoisCursos.save();


        const usuarioComUmCursoAposRemocao = await Usuario.findById(usuario._id);
        expect(usuarioComUmCursoAposRemocao.cursosIds).toHaveLength(1);
        expect(usuarioComUmCursoAposRemocao.cursosIds[0].toString()).toBe(cursoId2.toString());
    });


    test('deve criar campos timestamp automaticamente', async () => {
        const usuario = await Usuario.create({
            nome: 'Usuário Timestamps',
            email: 'timestamps@email.com',
            senha: 'Senha@123'
        });

        expect(usuario.createdAt).toBeDefined();
        expect(usuario.updatedAt).toBeDefined();
    });


    test('deve manter os tipos corretos para cada campo', async () => {
        const cursoId = new mongoose.Types.ObjectId();
        const usuario = await Usuario.create({
            nome: 'Usuário Tipos',
            email: 'tipos@email.com',
            senha: 'Senha@123',
            ativo: true,
            grupos: ['67607e1b123456789abcdef0'], // ID de exemplo de grupo
            progresso: [{
                percentual_conclusao: '100',
                curso: cursoId
            }],
            cursosIds: [cursoId]
        });

        expect(typeof usuario.nome).toBe('string');
        expect(typeof usuario.senha).toBe('string');
        expect(typeof usuario.email).toBe('string');
        expect(typeof usuario.ativo).toBe('boolean');
        expect(Array.isArray(usuario.grupos)).toBe(true);
        expect(Array.isArray(usuario.progresso)).toBe(true);
        expect(Array.isArray(usuario.cursosIds)).toBe(true);
        expect(usuario.cursosIds[0] instanceof mongoose.Types.ObjectId).toBe(true);
        expect(usuario.progresso[0].curso instanceof mongoose.Types.ObjectId).toBe(true);
    });
});