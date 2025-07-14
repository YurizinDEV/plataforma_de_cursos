// src/tests/unit/services/AulaService.test.js
import AulaService from '../../../../src/services/AulaService.js';
import AulaRepository from '../../../../src/repositories/AulaRepository.js';
import CursoRepository from '../../../../src/repositories/CursoRepository.js';
import { CustomError } from '../../../../src/utils/helpers/index.js';

jest.mock('../../../../src/repositories/AulaRepository.js');
jest.mock('../../../../src/repositories/CursoRepository.js');

describe('AulaService', () => {
  let service;

  beforeEach(() => {
    service = new AulaService();
  });

  it('listar() deve retornar aula por ID', async () => {
    const mockAula = { titulo: 'Aula X' };
    AulaRepository.prototype.buscarPorId.mockResolvedValue(mockAula);

    const result = await service.listar({ params: { id: '123' } });
    expect(result).toEqual(mockAula);
  });

  it('criar() deve lançar erro se curso não existir', async () => {
    CursoRepository.prototype.buscarPorId.mockResolvedValue(null);

    await expect(service.criar({ body: { cursoId: 'invalid' } }))
      .rejects
      .toThrow(CustomError);
  });

  it('criar() deve lançar erro se aula já existir no curso', async () => {
    CursoRepository.prototype.buscarPorId.mockResolvedValue({});
    AulaRepository.prototype.buscarPorTitulo.mockResolvedValue({});

    await expect(service.criar({
      body: {
        titulo: 'Repetida',
        cursoId: 'curso1',
      }
    })).rejects.toThrow(CustomError);
  });

  it('criar() deve salvar aula corretamente', async () => {
    CursoRepository.prototype.buscarPorId.mockResolvedValue({});
    AulaRepository.prototype.buscarPorTitulo.mockResolvedValue(null);
    AulaRepository.prototype.criar.mockResolvedValue({ titulo: 'Nova Aula' });

    const result = await service.criar({
      body: {
        titulo: 'Nova Aula',
        cursoId: 'curso1',
        conteudoURL: 'https://exemplo.com',
        cargaHoraria: 2,
        criadoPorId: '123'
      }
    });

    expect(result).toEqual({ titulo: 'Nova Aula' });
  });

  it('atualizar() deve lançar erro se aula não existir', async () => {
    AulaRepository.prototype.buscarPorId.mockResolvedValue(null);
    await expect(service.atualizar({ params: { id: 'notfound' }, body: {} }))
      .rejects.toThrow();
  });

  it('deletar() deve lançar erro se aula não existir', async () => {
    AulaRepository.prototype.buscarPorId.mockResolvedValue(null);
    await expect(service.deletar({ params: { id: 'notfound' } }))
      .rejects.toThrow();
  });
});
