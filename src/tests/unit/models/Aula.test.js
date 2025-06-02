import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Aula from '../../../models/Aula.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Modelo Aula', () => {
  test('deve criar uma aula válida', async () => {
    const aulaData = {
      titulo: 'Introdução ao Node.js',
      descricao: 'Aula introdutória sobre Node.js',
      conteudoURL: 'http://exemplo.com/aula1',
      cargaHoraria: 4,
      cursoId: new mongoose.Types.ObjectId(),
      criadoPorId: new mongoose.Types.ObjectId()
    };

    const aula = await Aula.create(aulaData);
    
    expect(aula._id).toBeDefined();
    expect(aula.titulo).toBe(aulaData.titulo);
    expect(aula.conteudoURL).toBe(aulaData.conteudoURL);
    expect(aula.cargaHoraria).toBe(aulaData.cargaHoraria);
  });

  test('deve falhar ao criar aula sem título', async () => {
    const aulaData = {
      descricao: 'Aula sem título',
      conteudoURL: 'http://exemplo.com/aula2',
      cargaHoraria: 2,
      cursoId: new mongoose.Types.ObjectId(),
      criadoPorId: new mongoose.Types.ObjectId()
    };

    await expect(Aula.create(aulaData)).rejects.toThrow();
  });

  test('deve falhar ao criar aula com carga horária menor que 1', async () => {
    const aulaData = {
      titulo: 'Aula inválida',
      conteudoURL: 'http://exemplo.com/aula3',
      cargaHoraria: 0,
      cursoId: new mongoose.Types.ObjectId(),
      criadoPorId: new mongoose.Types.ObjectId()
    };

    await expect(Aula.create(aulaData)).rejects.toThrow();
  });

  test('deve adicionar material complementar corretamente', async () => {
    const aulaData = {
      titulo: 'Aula com material',
      conteudoURL: 'http://exemplo.com/aula4',
      cargaHoraria: 3,
      materialComplementar: ['http://link1.com', 'http://link2.com'],
      cursoId: new mongoose.Types.ObjectId(),
      criadoPorId: new mongoose.Types.ObjectId()
    };

    const aula = await Aula.create(aulaData);
    expect(aula.materialComplementar).toHaveLength(2);
  });

  test('deve criar timestamps automaticamente', async () => {
    const aulaData = {
      titulo: 'Aula com timestamps',
      conteudoURL: 'http://exemplo.com/aula5',
      cargaHoraria: 2,
      cursoId: new mongoose.Types.ObjectId(),
      criadoPorId: new mongoose.Types.ObjectId()
    };

    const aula = await Aula.create(aulaData);
    expect(aula.createdAt).toBeDefined();
    expect(aula.updatedAt).toBeDefined();
  });
});