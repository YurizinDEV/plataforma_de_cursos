// src / tests / unit / services / CursoService.test.js
import mongoose from 'mongoose';
import {
    MongoMemoryServer
} from 'mongodb-memory-server';
import CursoService from '../../../services/CursoService.js';
import CursoModel from '../../../models/Curso.js';
import {
    CustomError
} from '../../../utils/helpers/index.js';

let mongoServer;
let cursoService;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    await mongoose.connection.collection('cursos').createIndex({
        titulo: 1
    }, {
        unique: true
    });
    cursoService = new CursoService();
});

beforeEach(async () => {
    await CursoModel.deleteMany({});
    jest.clearAllMocks();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

const cursoValido = {
    titulo: 'Curso de Teste',
    descricao: 'Descrição do curso de teste',
    cargaHorariaTotal: 20,
    criadoPorId: new mongoose.Types.ObjectId()
};


// ------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------
// Testes para o CursoService Listar GET e GET/:id

describe('CursoService', () => {
    // Testa o método listar() do serviço de cursos
    describe('listar()', () => {
        // Teste: Deve listar todos os cursos cadastrados
        test('deve listar cursos com sucesso', async () => {

            // Cria 3 cursos no banco de dados para o teste
            await CursoModel.create([
                cursoValido,
                {
                    ...cursoValido,
                    titulo: 'Outro Curso',
                    cargaHorariaTotal: 30
                },
                {
                    ...cursoValido,
                    titulo: 'Mais um Curso',
                    cargaHorariaTotal: 40
                }
            ]);

            // Simula uma requisição sem filtros
            const req = {
                query: {}
            };
            // Chama o método listar
            const resultado = await cursoService.listar(req);

            // Verifica se o resultado tem a propriedade 'docs' e se retornou 3 cursos
            expect(resultado).toHaveProperty('docs');
            expect(resultado.docs).toHaveLength(3);
        });

        // Teste: Deve buscar um curso específico pelo ID
        test('deve buscar curso específico por ID', async () => {
            // Cria um curso e pega o ID gerado
            const cursoCriado = await CursoModel.create(cursoValido);

            // Simula uma requisição com o ID do curso
            const req = {
                params: {
                    id: cursoCriado._id.toString()
                }
            };
            // Chama o método listar
            const resultado = await cursoService.listar(req);

            // Verifica se o curso retornado tem o mesmo ID
            expect(resultado).toHaveProperty('_id');
            expect(resultado._id.toString()).toBe(cursoCriado._id.toString());
        });

        // Teste: Deve aplicar filtros na consulta (exemplo: filtrar por título)
        test('deve aplicar filtros nas consultas', async () => {
            // Cria 3 cursos com títulos e tags diferentes
            await CursoModel.create([
                cursoValido,
                {
                    ...cursoValido,
                    titulo: 'Curso de JavaScript',
                    tags: ['javascript']
                },
                {
                    ...cursoValido,
                    titulo: 'Curso de Python',
                    tags: ['python']
                }
            ]);

            // Simula uma requisição filtrando pelo título "JavaScript"
            const req = {
                query: {
                    titulo: 'JavaScript'
                }
            };
            // Chama o método listar
            const resultado = await cursoService.listar(req);

            // Verifica se retornou apenas o curso filtrado
            expect(resultado).toHaveProperty('docs');
            expect(resultado.docs).toHaveLength(1);
            expect(resultado.docs[0].titulo).toBe('Curso de JavaScript');
        });

        // Teste: Deve lançar erro ao buscar um curso com ID inexistente
        test('deve lançar erro ao buscar curso com ID inexistente', async () => {
            // Gera um ID aleatório que não existe no banco
            const idInexistente = new mongoose.Types.ObjectId();
            const req = {
                params: {
                    id: idInexistente.toString()
                }
            };

            // Espera que o método listar lance um erro do tipo CustomError
            await expect(cursoService.listar(req)).rejects.toThrow(CustomError);
        });
    });

// ------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------
// Testes para o CursoService Criar POST

    // Testes para o método criar() do CursoService
    describe('criar()', () => {
        // Teste: Deve criar um curso com sucesso usando dados válidos
        test('deve criar curso com sucesso', async () => {
            const resultado = await cursoService.criar(cursoValido);

            // Verifica se o curso foi criado e possui os dados esperados
            expect(resultado).toHaveProperty('_id');
            expect(resultado.titulo).toBe(cursoValido.titulo);
            expect(resultado.cargaHorariaTotal).toBe(cursoValido.cargaHorariaTotal);
        });

        // Teste: Deve criar um curso mesmo que a carga horária não seja informada (deve ser zero)
        test('deve criar curso com carga horária zero', async () => {
            const cursoSemCarga = {
                titulo: 'Curso Sem Carga',
                descricao: 'Curso sem carga horária definida',
                criadoPorId: new mongoose.Types.ObjectId()
            };

            const resultado = await cursoService.criar(cursoSemCarga);

            // Verifica se a cargaHorariaTotal foi definida como 0
            expect(resultado).toHaveProperty('_id');
            expect(resultado.cargaHorariaTotal).toBe(0);
        });

        // Teste: Não deve permitir criar dois cursos com o mesmo título
        test('deve rejeitar curso com título já existente', async () => {

            // Cria o primeiro curso normalmente
            await cursoService.criar(cursoValido);

            // Tenta criar outro curso com o mesmo título e espera erro
            await expect(cursoService.criar({
                ...cursoValido,
                descricao: 'Outra descrição'
            })).rejects.toThrow(CustomError);
            await expect(cursoService.criar({
                ...cursoValido,
                descricao: 'Outra descrição'
            })).rejects.toThrow(/já está em uso/);
        });
    });


// ------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------
// Testes para o CursoService Atualizar PUT e PATCH

// Testes para o método atualizar() do CursoService
describe('atualizar()', () => {
    // Teste: Deve atualizar um curso com sucesso
    test('deve atualizar curso com sucesso', async () => {

        // Cria um curso no banco de dados
        const cursoCriado = await CursoModel.create(cursoValido);

        // Dados que serão usados para atualizar o curso
        const dadosAtualizados = {
            titulo: 'Curso Atualizado',
            cargaHorariaTotal: 30
        };

        // Chama o método atualizar do serviço
        const resultado = await cursoService.atualizar(cursoCriado._id, dadosAtualizados);

        // Verifica se os dados foram atualizados corretamente
        expect(resultado).toHaveProperty('_id');
        expect(resultado.titulo).toBe(dadosAtualizados.titulo);
        expect(resultado.cargaHorariaTotal).toBe(dadosAtualizados.cargaHorariaTotal);
        expect(resultado.descricao).toBe(cursoValido.descricao);
    });

    // Teste: Deve rejeitar atualização de curso inexistente
    test('deve rejeitar atualização de curso inexistente', async () => {
        // Gera um ID que não existe no banco
        const idInexistente = new mongoose.Types.ObjectId();
        const dadosAtualizados = {
            titulo: 'Curso Atualizado'
        };

        // Espera que o método lançar erro ao tentar atualizar curso inexistente
        await expect(cursoService.atualizar(idInexistente, dadosAtualizados))
            .rejects.toThrow(CustomError);
        await expect(cursoService.atualizar(idInexistente, dadosAtualizados))
            .rejects.toThrow(/não encontrado/);
    });

    // Teste: Não deve permitir atualizar para um título já usado por outro curso
    test('deve rejeitar atualização com título já utilizado por outro curso', async () => {

        // Cria dois cursos diferentes
        const curso1 = await CursoModel.create(cursoValido);
        const curso2 = await CursoModel.create({
            ...cursoValido,
            titulo: 'Outro Curso'
        });

        // Tenta atualizar o segundo curso com o título do primeiro
        await expect(cursoService.atualizar(curso2._id, {
            titulo: cursoValido.titulo
        })).rejects.toThrow(CustomError);
        await expect(cursoService.atualizar(curso2._id, {
            titulo: cursoValido.titulo
        })).rejects.toThrow(/já está em uso/);
    });

    // Teste: Deve permitir atualizar mantendo o mesmo título do próprio curso
    test('deve permitir atualização com mesmo título do próprio curso', async () => {

        // Cria um curso
        const cursoCriado = await CursoModel.create(cursoValido);

        // Atualiza o curso mantendo o mesmo título, mas mudando a descrição
        const dadosAtualizados = {
            titulo: cursoValido.titulo,
            descricao: 'Nova descrição'
        };

        // Chama o método atualizar
        const resultado = await cursoService.atualizar(cursoCriado._id, dadosAtualizados);

        // Verifica se a atualização foi feita corretamente
        expect(resultado).toHaveProperty('_id');
        expect(resultado.titulo).toBe(cursoValido.titulo);
        expect(resultado.descricao).toBe(dadosAtualizados.descricao);
    });
});

    
// ------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------
// Testes para o CursoService Deletar DELETE


    describe('deletar()', () => {
        // Testa se um curso pode ser deletado com sucesso
        test('deve deletar curso com sucesso', async () => {

            // Cria um curso válido no banco de dados
            const cursoCriado = await CursoModel.create(cursoValido);

            // Chama o método de deletar passando o ID do curso criado
            const resultado = await cursoService.deletar(cursoCriado._id);

            // Verifica se o resultado possui a propriedade _id
            expect(resultado).toHaveProperty('_id');
            // Verifica se o ID retornado é igual ao do curso criado
            expect(resultado._id.toString()).toBe(cursoCriado._id.toString());

            // Busca o curso no banco para garantir que foi removido
            const cursoExcluido = await CursoModel.findById(cursoCriado._id);
            // Espera que o curso não exista mais (null)
            expect(cursoExcluido).toBeNull();
        });

        // Testa se tentar deletar um curso inexistente gera erro
        test('deve rejeitar exclusão de curso inexistente', async () => {
            // Gera um ID aleatório que não existe no banco
            const idInexistente = new mongoose.Types.ObjectId();

            // Espera que a tentativa de deletar lance um erro do tipo CustomError
            await expect(cursoService.deletar(idInexistente))
                .rejects.toThrow(CustomError);
            // Espera que a mensagem do erro contenha "não encontrado"
            await expect(cursoService.deletar(idInexistente))
                .rejects.toThrow(/não encontrado/);
        });
    });


// ------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------


    describe('validateTitulo()', () => {
        test('deve validar título único com sucesso', async () => {

            await cursoService.validateTitulo('Título Único');

        });

        test('deve rejeitar título já utilizado', async () => {

            await CursoModel.create(cursoValido);


            await expect(cursoService.validateTitulo(cursoValido.titulo))
                .rejects.toThrow(CustomError);
            await expect(cursoService.validateTitulo(cursoValido.titulo))
                .rejects.toThrow(/já está em uso/);
        });

        test('deve permitir mesmo título para o mesmo curso (atualização)', async () => {

            const cursoCriado = await CursoModel.create(cursoValido);


            await cursoService.validateTitulo(
                cursoValido.titulo,
                cursoCriado._id
            );

        });
    });

    describe('ensureCursoExists()', () => {
        test('deve validar existência do curso com sucesso', async () => {

            const cursoCriado = await CursoModel.create(cursoValido);


            const resultado = await cursoService.ensureCursoExists(cursoCriado._id);

            expect(resultado).toHaveProperty('_id');
            expect(resultado._id.toString()).toBe(cursoCriado._id.toString());
        });

        test('deve rejeitar curso inexistente', async () => {
            const idInexistente = new mongoose.Types.ObjectId();

            await expect(cursoService.ensureCursoExists(idInexistente))
                .rejects.toThrow(CustomError);
            await expect(cursoService.ensureCursoExists(idInexistente))
                .rejects.toThrow(/não encontrado/);
        });
    });
});