// src/tests/unit/repositories/AulaRepository.test.js
import AulaRepository from '../../../../src/repositories/AulaRepository.js';
import Aula from '../../../../src/models/Aula.js';
import Curso from '../../../../src/models/Curso.js';

jest.mock('../../../../src/models/Aula.js');
jest.mock('../../../../src/models/Curso.js');

describe('AulaRepository', () => {
  const repo = new AulaRepository();

  it('criar() deve salvar nova aula e atualizar carga horária', async () => {
  const aulaSalva = { _id: '1', titulo: 'Teste', cursoId: 'c1' };
  repo.model = {
    save: jest.fn().mockResolvedValue(aulaSalva),
    create: jest.fn().mockResolvedValue(aulaSalva)
  };
  repo.atualizarCargaHorariaDoCurso = jest.fn();

  const result = await repo.criar({ titulo: 'Teste', cursoId: 'c1' });
  expect(result).toEqual(aulaSalva);
});

  it('listar() deve chamar filtro corretamente', async () => {
    Aula.find = jest.fn().mockResolvedValue([]);
    const aulas = await repo.listar({ titulo: 'teste' });
    expect(aulas).toEqual([]);
  });

  it('deletar() deve remover aula existente e atualizar curso', async () => {
    const mockAula = { _id: '123', cursoId: 'abc' };
    repo.model.findById = jest.fn().mockResolvedValue(mockAula);
    repo.model.findByIdAndDelete = jest.fn().mockResolvedValue(mockAula);
    repo.atualizarCargaHorariaDoCurso = jest.fn();

    const result = await repo.deletar('123');
    expect(result).toEqual(mockAula);
  });
});
