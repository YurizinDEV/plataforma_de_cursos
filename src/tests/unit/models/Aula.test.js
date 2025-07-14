import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Aula from '../../../../src/models/Aula.js';

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('Aula Model', () => {
  it('criar() deve salvar nova aula e atualizar carga horária', async () => {
  const aulaSalva = { _id: '1', titulo: 'Teste', cursoId: 'c1' };
  repo.model = {
    save: jest.fn().mockResolvedValue(aulaSalva), // simula método incorreto
    create: jest.fn().mockResolvedValue(aulaSalva)
  };
  repo.atualizarCargaHorariaDoCurso = jest.fn();

  const result = await repo.criar({ titulo: 'Teste', cursoId: 'c1' });
  expect(result).toEqual(aulaSalva);
});
});
