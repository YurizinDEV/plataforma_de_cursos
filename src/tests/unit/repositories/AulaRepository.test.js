  import mongoose from 'mongoose';
  import { MongoMemoryServer } from 'mongodb-memory-server';
  import AulaRepository from '../../../repositories/AulaRepository.js';
  import Aula from '../../../models/Aula.js';
  import { CustomError } from '../../../utils/helpers/index.js';

  let mongoServer;
  let aulaRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    
    aulaRepository = new AulaRepository();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('AulaRepository', () => {
    beforeEach(async () => {
      await Aula.deleteMany({});
    });

    test('deve lançar erro ao tentar atualizar aula inexistente', async () => {
    const idInvalido = new mongoose.Types.ObjectId();
    await expect(aulaRepository.atualizar(idInvalido, { titulo: 'Novo Título' }))
      .rejects.toThrow(CustomError);
  });

  test('deve lançar erro ao tentar deletar aula inexistente', async () => {
    const idInvalido = new mongoose.Types.ObjectId();
    await expect(aulaRepository.deletar(idInvalido))
      .rejects.toThrow(CustomError);
  });

    test('deve criar uma aula', async () => {
      const aulaData = {
        titulo: 'Aula Teste',
        conteudoURL: 'http://teste.com',
        cargaHoraria: 2,
        cursoId: new mongoose.Types.ObjectId(),
        criadoPorId: new mongoose.Types.ObjectId()
      };

      const result = await aulaRepository.criar(aulaData);
      expect(result._id).toBeDefined();
      expect(result.titulo).toBe(aulaData.titulo);
    });

    test('deve buscar aula por ID', async () => {
      const aula = await Aula.create({
        titulo: 'Aula para Busca',
        conteudoURL: 'http://busca.com',
        cargaHoraria: 3,
        cursoId: new mongoose.Types.ObjectId(),
        criadoPorId: new mongoose.Types.ObjectId()
      });

      const result = await aulaRepository.buscarPorId(aula._id);
      expect(result._id.toString()).toBe(aula._id.toString());
    });

    test('deve lançar erro ao buscar aula inexistente', async () => {
      const idInexistente = new mongoose.Types.ObjectId();
      await expect(aulaRepository.buscarPorId(idInexistente))
        .rejects.toThrow(CustomError);
    });

test('deve verificar existência de aula por curso', async () => {
  const cursoId = new mongoose.Types.ObjectId();
  await Aula.create({
    titulo: 'Aula Existente',
    conteudoURL: 'http://existente.com',
    cargaHoraria: 1,
    cursoId,
    criadoPorId: new mongoose.Types.ObjectId()
  });

  const result = await aulaRepository.buscarPorTitulo('Aula Existente', cursoId);
  expect(result).not.toBeNull();
});
    test('deve listar aulas com filtros', async () => {
      const cursoId = new mongoose.Types.ObjectId();
      await Aula.create([
        {
          titulo: 'Aula 1',
          conteudoURL: 'http://aula1.com',
          cargaHoraria: 2,
          cursoId,
          criadoPorId: new mongoose.Types.ObjectId()
        },
        {
          titulo: 'Aula 2',
          conteudoURL: 'http://aula2.com',
          cargaHoraria: 3,
          cursoId: new mongoose.Types.ObjectId(),
          criadoPorId: new mongoose.Types.ObjectId()
        }
      ]);

      const result = await aulaRepository.listar({ cursoId });
      expect(result.length).toBe(1);
      expect(result[0].titulo).toBe('Aula 1');
    });

    test('deve atualizar uma aula', async () => {
      const aula = await Aula.create({
        titulo: 'Aula Original',
        conteudoURL: 'http://original.com',
        cargaHoraria: 2,
        cursoId: new mongoose.Types.ObjectId(),
        criadoPorId: new mongoose.Types.ObjectId()
      });

      const atualizado = await aulaRepository.atualizar(aula._id, { titulo: 'Aula Atualizada' });
      expect(atualizado.titulo).toBe('Aula Atualizada');
    });

    test('deve deletar uma aula', async () => {
      const aula = await Aula.create({
        titulo: 'Aula para Deletar',
        conteudoURL: 'http://deletar.com',
        cargaHoraria: 1,
        cursoId: new mongoose.Types.ObjectId(),
        criadoPorId: new mongoose.Types.ObjectId()
      });

      const result = await aulaRepository.deletar(aula._id);
      expect(result._id.toString()).toBe(aula._id.toString());
      
      const deletado = await Aula.findById(aula._id);
      expect(deletado).toBeNull();
    });
  });