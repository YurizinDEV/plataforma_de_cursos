import {
    jest
} from '@jest/globals';
import mongoose from 'mongoose';
import {
    MongoMemoryServer
} from 'mongodb-memory-server';
import Curso from '../../../models/Curso.js';

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    await mongoose.connection.collection('cursos').createIndex({
        titulo: 1
    }, {
        unique: true
    });
});

beforeEach(async () => {
    await Curso.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Modelo de Curso', () => {
    describe('Cadastro de curso', () => {
        test('deve falhar ao salvar curso sem título', async () => {
            const cursoSemTitulo = new Curso({
                cargaHorariaTotal: 10,
                criadoPorId: new mongoose.Types.ObjectId()
            });

            await expect(cursoSemTitulo.save()).rejects.toThrow();
        });

        test('deve falhar ao salvar curso sem criadoPorId', async () => {
            const cursoSemCriador = new Curso({
                titulo: 'Curso Teste',
                cargaHorariaTotal: 10
            });

            await expect(cursoSemCriador.save()).rejects.toThrow();
        });

        test('deve salvar curso com todos campos obrigatórios', async () => {
            const cursoCompleto = new Curso({
                titulo: 'Curso Teste Completo',
                criadoPorId: new mongoose.Types.ObjectId()
            });

            const cursoSalvo = await cursoCompleto.save();
            expect(cursoSalvo).toHaveProperty('_id');
            expect(cursoSalvo.titulo).toBe('Curso Teste Completo');
            expect(cursoSalvo.cargaHorariaTotal).toBe(0);
        });

        test('deve salvar curso com cargaHorariaTotal = 0', async () => {
            const cursoComCargaZero = new Curso({
                titulo: 'Curso Com Carga Zero',
                cargaHorariaTotal: 0,
                criadoPorId: new mongoose.Types.ObjectId()
            });

            const cursoSalvo = await cursoComCargaZero.save();
            expect(cursoSalvo).toHaveProperty('_id');
            expect(cursoSalvo.cargaHorariaTotal).toBe(0);
        });

        test('deve falhar ao salvar curso com cargaHorariaTotal negativa', async () => {
            const cursoComCargaNegativa = new Curso({
                titulo: 'Curso Com Carga Negativa',
                cargaHorariaTotal: -1,
                criadoPorId: new mongoose.Types.ObjectId()
            });

            await expect(cursoComCargaNegativa.save()).rejects.toThrow();
        });

        test('deve inicializar arrays como vazios quando não fornecidos', async () => {
            const cursoSemArrays = new Curso({
                titulo: 'Curso Sem Arrays',
                criadoPorId: new mongoose.Types.ObjectId()
            });

            const cursoSalvo = await cursoSemArrays.save();
            expect(Array.isArray(cursoSalvo.materialComplementar)).toBe(true);
            expect(cursoSalvo.materialComplementar).toHaveLength(0);
            expect(Array.isArray(cursoSalvo.professores)).toBe(true);
            expect(cursoSalvo.professores).toHaveLength(0);
            expect(Array.isArray(cursoSalvo.tags)).toBe(true);
            expect(cursoSalvo.tags).toHaveLength(0);
        });

        test('deve falhar ao salvar dois cursos com o mesmo título', async () => {
            const curso1 = new Curso({
                titulo: 'Curso com Título Duplicado',
                criadoPorId: new mongoose.Types.ObjectId()
            });
            await curso1.save();

            const curso2 = new Curso({
                titulo: 'Curso com Título Duplicado',
                criadoPorId: new mongoose.Types.ObjectId()
            });
            await expect(curso2.save()).rejects.toThrow();
        });
    });

    describe('Leitura e atualização de curso', () => {
        test('deve ler curso cadastrado corretamente', async () => {
            const cursoOriginal = new Curso({
                titulo: 'Curso para Leitura',
                descricao: 'Descrição do curso',
                cargaHorariaTotal: 20,
                criadoPorId: new mongoose.Types.ObjectId()
            });
            await cursoOriginal.save();

            const cursoLido = await Curso.findOne({
                titulo: 'Curso para Leitura'
            });
            expect(cursoLido).toHaveProperty('_id');
            expect(cursoLido.titulo).toBe('Curso para Leitura');
            expect(cursoLido.descricao).toBe('Descrição do curso');
            expect(cursoLido.cargaHorariaTotal).toBe(20);
        });

        test('deve atualizar curso corretamente', async () => {
            const cursoOriginal = new Curso({
                titulo: 'Curso para Atualizar',
                cargaHorariaTotal: 10,
                criadoPorId: new mongoose.Types.ObjectId()
            });
            const cursoSalvo = await cursoOriginal.save();

            const cursoAtualizado = await Curso.findByIdAndUpdate(
                cursoSalvo._id, {
                    titulo: 'Curso Atualizado',
                    cargaHorariaTotal: 15
                }, {
                    new: true
                }
            );

            expect(cursoAtualizado.titulo).toBe('Curso Atualizado');
            expect(cursoAtualizado.cargaHorariaTotal).toBe(15);
        });

        test('deve remover curso corretamente', async () => {
            const cursoParaRemover = new Curso({
                titulo: 'Curso para Remover',
                criadoPorId: new mongoose.Types.ObjectId()
            });
            const cursoSalvo = await cursoParaRemover.save();

            await Curso.findByIdAndDelete(cursoSalvo._id);
            const cursoBuscado = await Curso.findById(cursoSalvo._id);
            expect(cursoBuscado).toBeNull();
        });
    });
});