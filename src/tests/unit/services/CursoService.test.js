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

describe('CursoService', () => {
    describe('listar()', () => {
        test('deve listar cursos com sucesso', async () => {

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

            const req = {
                query: {}
            };
            const resultado = await cursoService.listar(req);

            expect(resultado).toHaveProperty('docs');
            expect(resultado.docs).toHaveLength(3);
        });

        test('deve buscar curso específico por ID', async () => {
            const cursoCriado = await CursoModel.create(cursoValido);

            const req = {
                params: {
                    id: cursoCriado._id.toString()
                }
            };
            const resultado = await cursoService.listar(req);

            expect(resultado).toHaveProperty('_id');
            expect(resultado._id.toString()).toBe(cursoCriado._id.toString());
        });

        test('deve aplicar filtros nas consultas', async () => {
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

            const req = {
                query: {
                    titulo: 'JavaScript'
                }
            };
            const resultado = await cursoService.listar(req);

            expect(resultado).toHaveProperty('docs');
            expect(resultado.docs).toHaveLength(1);
            expect(resultado.docs[0].titulo).toBe('Curso de JavaScript');
        });

        test('deve lançar erro ao buscar curso com ID inexistente', async () => {
            const idInexistente = new mongoose.Types.ObjectId();
            const req = {
                params: {
                    id: idInexistente.toString()
                }
            };

            await expect(cursoService.listar(req)).rejects.toThrow(CustomError);
        });
    });

    describe('criar()', () => {
        test('deve criar curso com sucesso', async () => {
            const resultado = await cursoService.criar(cursoValido);

            expect(resultado).toHaveProperty('_id');
            expect(resultado.titulo).toBe(cursoValido.titulo);
            expect(resultado.cargaHorariaTotal).toBe(cursoValido.cargaHorariaTotal);
        });

        test('deve criar curso com carga horária zero', async () => {
            const cursoSemCarga = {
                titulo: 'Curso Sem Carga',
                descricao: 'Curso sem carga horária definida',
                criadoPorId: new mongoose.Types.ObjectId()
            };

            const resultado = await cursoService.criar(cursoSemCarga);

            expect(resultado).toHaveProperty('_id');
            expect(resultado.cargaHorariaTotal).toBe(0);
        });

        test('deve rejeitar curso com título já existente', async () => {

            await cursoService.criar(cursoValido);


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

    describe('atualizar()', () => {
        test('deve atualizar curso com sucesso', async () => {

            const cursoCriado = await CursoModel.create(cursoValido);


            const dadosAtualizados = {
                titulo: 'Curso Atualizado',
                cargaHorariaTotal: 30
            };

            const resultado = await cursoService.atualizar(cursoCriado._id, dadosAtualizados);

            expect(resultado).toHaveProperty('_id');
            expect(resultado.titulo).toBe(dadosAtualizados.titulo);
            expect(resultado.cargaHorariaTotal).toBe(dadosAtualizados.cargaHorariaTotal);
            expect(resultado.descricao).toBe(cursoValido.descricao);
        });

        test('deve rejeitar atualização de curso inexistente', async () => {
            const idInexistente = new mongoose.Types.ObjectId();
            const dadosAtualizados = {
                titulo: 'Curso Atualizado'
            };

            await expect(cursoService.atualizar(idInexistente, dadosAtualizados))
                .rejects.toThrow(CustomError);
            await expect(cursoService.atualizar(idInexistente, dadosAtualizados))
                .rejects.toThrow(/não encontrado/);
        });

        test('deve rejeitar atualização com título já utilizado por outro curso', async () => {

            const curso1 = await CursoModel.create(cursoValido);
            const curso2 = await CursoModel.create({
                ...cursoValido,
                titulo: 'Outro Curso'
            });


            await expect(cursoService.atualizar(curso2._id, {
                titulo: cursoValido.titulo
            })).rejects.toThrow(CustomError);
            await expect(cursoService.atualizar(curso2._id, {
                titulo: cursoValido.titulo
            })).rejects.toThrow(/já está em uso/);
        });

        test('deve permitir atualização com mesmo título do próprio curso', async () => {

            const cursoCriado = await CursoModel.create(cursoValido);


            const dadosAtualizados = {
                titulo: cursoValido.titulo,
                descricao: 'Nova descrição'
            };

            const resultado = await cursoService.atualizar(cursoCriado._id, dadosAtualizados);

            expect(resultado).toHaveProperty('_id');
            expect(resultado.titulo).toBe(cursoValido.titulo);
            expect(resultado.descricao).toBe(dadosAtualizados.descricao);
        });
    });

    describe('deletar()', () => {
        test('deve deletar curso com sucesso', async () => {

            const cursoCriado = await CursoModel.create(cursoValido);


            const resultado = await cursoService.deletar(cursoCriado._id);

            expect(resultado).toHaveProperty('_id');
            expect(resultado._id.toString()).toBe(cursoCriado._id.toString());


            const cursoExcluido = await CursoModel.findById(cursoCriado._id);
            expect(cursoExcluido).toBeNull();
        });

        test('deve rejeitar exclusão de curso inexistente', async () => {
            const idInexistente = new mongoose.Types.ObjectId();

            await expect(cursoService.deletar(idInexistente))
                .rejects.toThrow(CustomError);
            await expect(cursoService.deletar(idInexistente))
                .rejects.toThrow(/não encontrado/);
        });
    });

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