import mongoose from 'mongoose';
import {
    MongoMemoryServer
} from 'mongodb-memory-server';
import CursoController from '../../../controllers/CursoController.js';
import CursoModel from '../../../models/Curso.js';
import {
    CustomError,
    HttpStatusCodes
} from '../../../utils/helpers/index.js';
import {
    CursoQuerySchema
} from '../../../utils/validators/schemas/zod/querys/CursoQuerySchema.js';
import {
    CursoSchema
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
    criadoPorId: new mongoose.Types.ObjectId().toString()
};

describe('CursoController', () => {
    describe('listar()', () => {
        test('deve listar cursos com sucesso', async () => {

            const cursos = await CursoModel.create([
                cursoValido,
                {
                    ...cursoValido,
                    titulo: 'Outro Curso'
                },
                {
                    ...cursoValido,
                    titulo: 'Mais Um Curso'
                }
            ]);

            const req = mockRequest();
            const res = mockResponse();

            await cursoController.listar(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.data).toHaveProperty('error', false);
            expect(res.data).toHaveProperty('data');
            expect(res.data.data).toHaveProperty('docs');
            expect(res.data.data.docs).toHaveLength(3);
        });

        test('deve buscar curso por ID com sucesso', async () => {
            const cursoCriado = await CursoModel.create(cursoValido);

            const req = mockRequest();
            req.params.id = cursoCriado._id.toString();
            const res = mockResponse();

            await cursoController.listar(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.data).toHaveProperty('error', false);
            expect(res.data).toHaveProperty('data');
            expect(res.data.data).toHaveProperty('_id');
            expect(res.data.data._id.toString()).toBe(cursoCriado._id.toString());
        });

        test('deve filtrar cursos por query params', async () => {
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

            const req = mockRequest();
            req.query = {
                titulo: 'JavaScript'
            };
            const res = mockResponse();

            await cursoController.listar(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.data).toHaveProperty('error', false);
            expect(res.data.data.docs).toHaveLength(1);
            expect(res.data.data.docs[0].titulo).toBe('Curso de JavaScript');
        });

        test('deve retornar 404 para ID inexistente', async () => {
            const req = mockRequest();
            req.params.id = new mongoose.Types.ObjectId().toString();
            const res = mockResponse();

            await expect(cursoController.listar(req, res)).rejects.toThrow(CustomError);
        });

        test('deve validar query params antes de listar', async () => {

            jest.spyOn(CursoQuerySchema, 'parseAsync').mockImplementationOnce(() => {
                throw new Error('Erro de validação');
            });

            const req = mockRequest();
            req.query = {
                cargaHorariaMin: -5
            };
            const res = mockResponse();

            await expect(cursoController.listar(req, res)).rejects.toThrow();
        });
    });

    describe('criar()', () => {
        test('deve criar um curso com sucesso', async () => {
            const req = mockRequest();
            req.body = cursoValido;
            const res = mockResponse();

            await cursoController.criar(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.data).toHaveProperty('error', false);
            expect(res.data).toHaveProperty('data');
            expect(res.data.data).toHaveProperty('titulo', cursoValido.titulo);
            expect(res.data).toHaveProperty('message', "Curso criado com sucesso.");
        });

        test('deve criar um curso com cargaHorariaTotal zero', async () => {
            const req = mockRequest();
            req.body = {
                ...cursoValido,
                cargaHorariaTotal: 0
            };
            const res = mockResponse();

            await cursoController.criar(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.data.data).toHaveProperty('cargaHorariaTotal', 0);
        });

        test('deve rejeitar curso sem título', async () => {

            jest.spyOn(CursoSchema, 'parse').mockImplementationOnce(() => {
                throw new Error('Título é obrigatório');
            });

            const req = mockRequest();
            const cursoSemTitulo = {
                ...cursoValido
            };
            delete cursoSemTitulo.titulo;
            req.body = cursoSemTitulo;
            const res = mockResponse();

            await expect(cursoController.criar(req, res)).rejects.toThrow();
        });

        test('deve rejeitar curso com título já existente', async () => {

            await CursoModel.create(cursoValido);


            const req = mockRequest();
            req.body = cursoValido;
            const res = mockResponse();

            await expect(cursoController.criar(req, res)).rejects.toThrow(CustomError);
        });
    });

    describe('atualizar()', () => {
        test('deve atualizar curso com sucesso', async () => {

            const cursoCriado = await CursoModel.create(cursoValido);


            const req = mockRequest();
            req.params.id = cursoCriado._id.toString();
            req.body = {
                titulo: 'Curso Atualizado',
                cargaHorariaTotal: 30
            };
            const res = mockResponse();

            await cursoController.atualizar(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.data).toHaveProperty('error', false);
            expect(res.data).toHaveProperty('data');
            expect(res.data.data).toHaveProperty('titulo', 'Curso Atualizado');
            expect(res.data.data).toHaveProperty('cargaHorariaTotal', 30);
            expect(res.data).toHaveProperty('message', 'Curso atualizado com sucesso.');
        });

        test('deve rejeitar atualização sem dados', async () => {

            const cursoCriado = await CursoModel.create(cursoValido);


            const req = mockRequest();
            req.params.id = cursoCriado._id.toString();
            req.body = {};
            const res = mockResponse();

            await expect(cursoController.atualizar(req, res)).rejects.toThrow(CustomError);
            await expect(cursoController.atualizar(req, res)).rejects.toThrow(/Nenhum dado fornecido/);
        });

        test('deve rejeitar atualização de curso inexistente', async () => {
            const req = mockRequest();
            req.params.id = new mongoose.Types.ObjectId().toString();
            req.body = {
                titulo: 'Curso Atualizado'
            };
            const res = mockResponse();

            await expect(cursoController.atualizar(req, res)).rejects.toThrow(CustomError);
            await expect(cursoController.atualizar(req, res)).rejects.toThrow(/não encontrado/);
        });

        test('deve validar dados antes de atualizar', async () => {

            const cursoCriado = await CursoModel.create(cursoValido);


            const CursoUpdateSchemaMock = jest.requireMock('../../../utils/validators/schemas/zod/CursoSchema.js').CursoUpdateSchema;
            jest.spyOn(CursoUpdateSchemaMock, 'parse').mockImplementationOnce(() => {
                throw new Error('Erro de validação');
            });

            const req = mockRequest();
            req.params.id = cursoCriado._id.toString();
            req.body = {
                cargaHorariaTotal: -5
            };
            const res = mockResponse();

            await expect(cursoController.atualizar(req, res)).rejects.toThrow();
        });
    });

    describe('deletar()', () => {
        test('deve deletar curso com sucesso', async () => {

            const cursoCriado = await CursoModel.create(cursoValido);


            const req = mockRequest();
            req.params.id = cursoCriado._id.toString();
            const res = mockResponse();

            await cursoController.deletar(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.data).toHaveProperty('error', false);
            expect(res.data).toHaveProperty('data');
            expect(res.data.data).toHaveProperty('_id');
            expect(res.data.data._id.toString()).toBe(cursoCriado._id.toString());
            expect(res.data).toHaveProperty('message', 'Curso removido com sucesso.');


            const cursoRemovido = await CursoModel.findById(cursoCriado._id);
            expect(cursoRemovido).toBeNull();
        });

        test('deve rejeitar exclusão sem ID', async () => {
            const req = mockRequest();
            req.params = {};
            const res = mockResponse();

            await expect(cursoController.deletar(req, res)).rejects.toThrow(CustomError);
            await expect(cursoController.deletar(req, res)).rejects.toThrow(/ID do curso não fornecido/);
        });

        test('deve rejeitar exclusão de curso inexistente', async () => {
            const req = mockRequest();
            req.params.id = new mongoose.Types.ObjectId().toString();
            const res = mockResponse();

            await expect(cursoController.deletar(req, res)).rejects.toThrow(CustomError);
            await expect(cursoController.deletar(req, res)).rejects.toThrow(/não encontrado/);
        });

        test('deve validar ID antes de deletar', async () => {
            const req = mockRequest();
            req.params.id = 'id-invalido';
            const res = mockResponse();

            await expect(cursoController.deletar(req, res)).rejects.toThrow();
        });
    });
});