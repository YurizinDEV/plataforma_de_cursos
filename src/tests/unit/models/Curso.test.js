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

        test('deve validar que curso só pode ser cadastrado se possuir título e criadoPorId', async () => {
            // Teste sem título
            const cursoSemTitulo = new Curso({
                cargaHorariaTotal: 10,
                criadoPorId: new mongoose.Types.ObjectId()
            });
            await expect(cursoSemTitulo.save()).rejects.toThrow(/required/);

            // Teste sem criadoPorId
            const cursoSemCriador = new Curso({
                titulo: 'Curso Teste',
                cargaHorariaTotal: 10
            });
            await expect(cursoSemCriador.save()).rejects.toThrow(/required/);
        });

        test('deve salvar curso válido com título único, carga horária e criadoPorId', async () => {
            const cursoCompleto = new Curso({
                titulo: 'Curso Teste Completo',
                cargaHorariaTotal: 40,
                criadoPorId: new mongoose.Types.ObjectId()
            });

            const cursoSalvo = await cursoCompleto.save();
            expect(cursoSalvo).toHaveProperty('_id');
            expect(cursoSalvo.titulo).toBe('Curso Teste Completo');
            expect(cursoSalvo.cargaHorariaTotal).toBe(40);
            expect(cursoSalvo.criadoPorId).toBeDefined();
        });

        test('não deve permitir cadastrar dois cursos com o mesmo título', async () => {
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

        test('deve validar carga horária - valor padrão 0 quando omitido', async () => {
            const cursoSemCarga = new Curso({
                titulo: 'Curso Sem Carga Horária Definida',
                criadoPorId: new mongoose.Types.ObjectId()
            });

            const cursoSalvo = await cursoSemCarga.save();
            expect(cursoSalvo.cargaHorariaTotal).toBe(0);
        });

        test('deve validar carga horária - aceitar valor 0', async () => {
            const cursoComCargaZero = new Curso({
                titulo: 'Curso Com Carga Zero',
                cargaHorariaTotal: 0,
                criadoPorId: new mongoose.Types.ObjectId()
            });

            const cursoSalvo = await cursoComCargaZero.save();
            expect(cursoSalvo.cargaHorariaTotal).toBe(0);
        });

        test('deve falhar ao salvar curso com carga horária negativa', async () => {
            const cursoComCargaNegativa = new Curso({
                titulo: 'Curso Com Carga Negativa',
                cargaHorariaTotal: -1,
                criadoPorId: new mongoose.Types.ObjectId()
            });

            await expect(cursoComCargaNegativa.save()).rejects.toThrow(/min/);
        });

        test('deve ter referência válida ao usuário que criou o curso', async () => {
            const criadoPorId = new mongoose.Types.ObjectId();
            const curso = new Curso({
                titulo: 'Curso Com Criador',
                criadoPorId: criadoPorId
            });

            const cursoSalvo = await curso.save();
            expect(cursoSalvo.criadoPorId).toEqual(criadoPorId);
            expect(mongoose.Types.ObjectId.isValid(cursoSalvo.criadoPorId)).toBe(true);
        });

        test('deve salvar curso sem campos opcionais', async () => {
            const cursoMinimo = new Curso({
                titulo: 'Curso Mínimo',
                criadoPorId: new mongoose.Types.ObjectId()
            });

            const cursoSalvo = await cursoMinimo.save();
            expect(cursoSalvo).toHaveProperty('_id');
            expect(cursoSalvo.titulo).toBe('Curso Mínimo');
            expect(cursoSalvo.descricao).toBeUndefined();
            expect(cursoSalvo.thumbnail).toBeUndefined();
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
    });

    describe('Leitura de cursos', () => {
        test('deve retornar todos os cursos cadastrados', async () => {
            // Criar múltiplos cursos
            const curso1 = new Curso({
                titulo: 'Curso 1',
                criadoPorId: new mongoose.Types.ObjectId()
            });
            const curso2 = new Curso({
                titulo: 'Curso 2',
                criadoPorId: new mongoose.Types.ObjectId()
            });
            const curso3 = new Curso({
                titulo: 'Curso 3',
                criadoPorId: new mongoose.Types.ObjectId()
            });

            await curso1.save();
            await curso2.save();
            await curso3.save();

            const cursosEncontrados = await Curso.find({});
            expect(cursosEncontrados).toHaveLength(3);

            const titulos = cursosEncontrados.map(curso => curso.titulo);
            expect(titulos).toContain('Curso 1');
            expect(titulos).toContain('Curso 2');
            expect(titulos).toContain('Curso 3');
        });

        test('deve ler curso cadastrado corretamente', async () => {
            const cursoOriginal = new Curso({
                titulo: 'Curso para Leitura',
                descricao: 'Descrição do curso',
                cargaHorariaTotal: 20,
                materialComplementar: ['Material 1', 'Material 2'],
                professores: ['Professor A', 'Professor B'],
                tags: ['tag1', 'tag2'],
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
            expect(cursoLido.materialComplementar).toEqual(['Material 1', 'Material 2']);
            expect(cursoLido.professores).toEqual(['Professor A', 'Professor B']);
            expect(cursoLido.tags).toEqual(['tag1', 'tag2']);
        });
    });

    describe('Atualização de curso', () => {
        test('deve atualizar informações de um curso válido', async () => {
            const cursoOriginal = new Curso({
                titulo: 'Curso para Atualizar',
                descricao: 'Descrição original',
                cargaHorariaTotal: 10,
                criadoPorId: new mongoose.Types.ObjectId()
            });
            const cursoSalvo = await cursoOriginal.save();

            const cursoAtualizado = await Curso.findByIdAndUpdate(
                cursoSalvo._id, {
                    titulo: 'Curso Atualizado',
                    descricao: 'Nova descrição',
                    cargaHorariaTotal: 15,
                    materialComplementar: ['Novo material'],
                    tags: ['nova-tag']
                }, {
                    new: true
                }
            );

            expect(cursoAtualizado.titulo).toBe('Curso Atualizado');
            expect(cursoAtualizado.descricao).toBe('Nova descrição');
            expect(cursoAtualizado.cargaHorariaTotal).toBe(15);
            expect(cursoAtualizado.materialComplementar).toEqual(['Novo material']);
            expect(cursoAtualizado.tags).toEqual(['nova-tag']);
        });

        test('deve refletir os dados alterados após atualização', async () => {
            const curso = new Curso({
                titulo: 'Curso Original',
                cargaHorariaTotal: 20,
                criadoPorId: new mongoose.Types.ObjectId()
            });
            const cursoSalvo = await curso.save();

            await Curso.updateOne({
                _id: cursoSalvo._id
            }, {
                titulo: 'Curso Modificado',
                cargaHorariaTotal: 30
            });

            const cursoVerificado = await Curso.findById(cursoSalvo._id);
            expect(cursoVerificado.titulo).toBe('Curso Modificado');
            expect(cursoVerificado.cargaHorariaTotal).toBe(30);
        });
    });

    describe('Remoção de curso', () => {
        test('deve remover curso existente sem dependências', async () => {
            const cursoParaRemover = new Curso({
                titulo: 'Curso para Remover',
                criadoPorId: new mongoose.Types.ObjectId()
            });
            const cursoSalvo = await cursoParaRemover.save();

            const resultado = await Curso.deleteOne({
                _id: cursoSalvo._id
            });
            expect(resultado.deletedCount).toBe(1);

            const cursoBuscado = await Curso.findById(cursoSalvo._id);
            expect(cursoBuscado).toBeNull();
        });

        test('deve não aparecer mais na listagem após remoção', async () => {
            const curso1 = new Curso({
                titulo: 'Curso 1',
                criadoPorId: new mongoose.Types.ObjectId()
            });
            const curso2 = new Curso({
                titulo: 'Curso 2',
                criadoPorId: new mongoose.Types.ObjectId()
            });

            await curso1.save();
            const curso2Salvo = await curso2.save();

            await Curso.findByIdAndDelete(curso2Salvo._id);

            const cursosRestantes = await Curso.find({});
            expect(cursosRestantes).toHaveLength(1);
            expect(cursosRestantes[0].titulo).toBe('Curso 1');
        });
    });

    describe('Campos automáticos e timestamps', () => {
        test('deve incluir timestamps createdAt e updatedAt', async () => {
            const curso = new Curso({
                titulo: 'Curso com Timestamps',
                criadoPorId: new mongoose.Types.ObjectId()
            });

            const cursoSalvo = await curso.save();
            expect(cursoSalvo.createdAt).toBeDefined();
            expect(cursoSalvo.updatedAt).toBeDefined();
            expect(cursoSalvo.createdAt).toBeInstanceOf(Date);
            expect(cursoSalvo.updatedAt).toBeInstanceOf(Date);
        });

        test('deve atualizar updatedAt quando curso é modificado', async () => {
            const curso = new Curso({
                titulo: 'Curso para Testar Timestamp',
                criadoPorId: new mongoose.Types.ObjectId()
            });

            const cursoSalvo = await curso.save();
            const timestampOriginal = cursoSalvo.updatedAt;

            // Aguardar um pouco para garantir diferença no timestamp
            await new Promise(resolve => setTimeout(resolve, 10));

            await Curso.findByIdAndUpdate(cursoSalvo._id, {
                titulo: 'Título Atualizado'
            });

            const cursoAtualizado = await Curso.findById(cursoSalvo._id);
            expect(cursoAtualizado.updatedAt.getTime()).toBeGreaterThan(timestampOriginal.getTime());
        });
    });

    describe('Validações de schema', () => {
        test('deve validar limite máximo do título (100 caracteres)', async () => {
            const tituloLongo = 'A'.repeat(101); // 101 caracteres
            const curso = new Curso({
                titulo: tituloLongo,
                criadoPorId: new mongoose.Types.ObjectId()
            });

            await expect(curso.save()).rejects.toThrow();
        });

        test('deve validar limite máximo do thumbnail (250 caracteres)', async () => {
            const thumbnailLongo = 'A'.repeat(251); // 251 caracteres
            const curso = new Curso({
                titulo: 'Curso Teste',
                thumbnail: thumbnailLongo,
                criadoPorId: new mongoose.Types.ObjectId()
            });

            await expect(curso.save()).rejects.toThrow();
        });

        test('deve aceitar título e thumbnail dentro dos limites', async () => {
            const curso = new Curso({
                titulo: 'A'.repeat(100), // Exatamente 100 caracteres
                thumbnail: 'A'.repeat(250), // Exatamente 250 caracteres
                criadoPorId: new mongoose.Types.ObjectId()
            });

            const cursoSalvo = await curso.save();
            expect(cursoSalvo).toHaveProperty('_id');
            expect(cursoSalvo.titulo).toHaveLength(100);
            expect(cursoSalvo.thumbnail).toHaveLength(250);
        });
    });
});

//cd "c:\Users\Yuri\Music\IFRO\plataforma-de-cursos" && npx jest src/tests/unit/models/Curso.test.js --coverage --detectOpenHandles