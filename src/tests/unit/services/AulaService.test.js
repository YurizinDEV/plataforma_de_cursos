import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import AulaService from '../../../services/AulaService.js';
import Aula from '../../../models/Aula.js';
import { CustomError } from '../../../utils/helpers/index.js';

let mongoServer;
let aulaService;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  aulaService = new AulaService();
  aulaService.cursoRepository = {
    buscarPorId: jest.fn()
  };
  aulaService.repositoryAula = {
    criar: jest.fn(),
    buscarPorTitulo: jest.fn(),
    listar: jest.fn(),
    buscarPorId: jest.fn(),
    atualizar: jest.fn(),
    deletar: jest.fn()
  };
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('AulaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('criar', () => {
    test('deve criar uma aula com curso valido', async () => {
      const mockCursoId = new mongoose.Types.ObjectId();
      const aulaData = {
        titulo: 'Nova Aula',
        conteudoURL: 'http://nova.com',
        cargaHoraria: 2,
        cursoId: mockCursoId,
        criadoPorId: new mongoose.Types.ObjectId()
      };

      aulaService.cursoRepository.buscarPorId.mockResolvedValue({ _id: mockCursoId });
      aulaService.repositoryAula.buscarPorTitulo.mockResolvedValue(null);
      aulaService.repositoryAula.criar.mockResolvedValue(aulaData);

      const result = await aulaService.criar({ body: aulaData });
      expect(result).toEqual(aulaData);
      expect(aulaService.cursoRepository.buscarPorId).toHaveBeenCalledWith(aulaData.cursoId);
      expect(aulaService.repositoryAula.buscarPorTitulo).toHaveBeenCalledWith(aulaData.titulo, aulaData.cursoId);
      expect(aulaService.repositoryAula.criar).toHaveBeenCalledWith(aulaData);
    });

    test('deve falhar ao criar aula com curso inexistente', async () => {
      const aulaData = {
        titulo: 'Aula sem Curso',
        conteudoURL: 'http://semcurso.com',
        cargaHoraria: 1,
        cursoId: new mongoose.Types.ObjectId(),
        criadoPorId: new mongoose.Types.ObjectId()
      };

      aulaService.cursoRepository.buscarPorId.mockResolvedValue(null);

      await expect(aulaService.criar({ body: aulaData }))
        .rejects.toMatchObject({
          customMessage: 'Curso não encontrado',
          statusCode: { code: 404 }
        });
    });

    test('deve falhar ao criar aula duplicada no mesmo curso', async () => {
      const mockCursoId = new mongoose.Types.ObjectId();
      const aulaData = {
        titulo: 'Aula Duplicada',
        conteudoURL: 'http://duplicada.com',
        cargaHoraria: 3,
        cursoId: mockCursoId,
        criadoPorId: new mongoose.Types.ObjectId()
      };

      aulaService.cursoRepository.buscarPorId.mockResolvedValue({ _id: mockCursoId });
      aulaService.repositoryAula.buscarPorTitulo.mockResolvedValue({ _id: new mongoose.Types.ObjectId() });

      await expect(aulaService.criar({ body: aulaData }))
        .rejects.toMatchObject({
          customMessage: 'Esta aula já existe neste curso',
          statusCode: { code: 409 }
        });
    });
  });

  describe('listar', () => {
    test('deve listar todas as aulas sem filtros', async () => {
  const mockAulas = [
    { titulo: 'Aula 1', conteudoURL: 'http://aula1.com', cargaHoraria: 2 },
    { titulo: 'Aula 2', conteudoURL: 'http://aula2.com', cargaHoraria: 3 }
  ];
  
  aulaService.repositoryAula.listar.mockResolvedValue(mockAulas);

  const result = await aulaService.listar({ query: {} });
  expect(result).toEqual(mockAulas);
  expect(aulaService.repositoryAula.listar).toHaveBeenCalledWith({});
});

    test('deve listar aulas com filtros', async () => {
      const cursoId = new mongoose.Types.ObjectId();
      const mockAulas = [
        { titulo: 'Aula Filtrada', conteudoURL: 'http://filtrada.com', cargaHoraria: 2, cursoId }
      ];
      
      aulaService.repositoryAula.listar.mockResolvedValue(mockAulas);

      const result = await aulaService.listar({ query: { cursoId } });
      expect(result).toEqual(mockAulas);
      expect(aulaService.repositoryAula.listar).toHaveBeenCalledWith({ cursoId });
    });

    test('deve retornar aula específica quando ID é fornecido', async () => {
      const mockAula = {
        _id: new mongoose.Types.ObjectId(),
        titulo: 'Aula Específica',
        conteudoURL: 'http://especifica.com',
        cargaHoraria: 1
      };
      
      aulaService.repositoryAula.buscarPorId.mockResolvedValue(mockAula);

      const result = await aulaService.listar({ params: { id: mockAula._id } });
      expect(result).toEqual(mockAula);
      expect(aulaService.repositoryAula.buscarPorId).toHaveBeenCalledWith(mockAula._id);
    });

    test('deve lançar erro quando aula não encontrada por ID', async () => {
      const idInexistente = new mongoose.Types.ObjectId();
      aulaService.repositoryAula.buscarPorId.mockResolvedValue(null);

      await expect(aulaService.listar({ params: { id: idInexistente } }))
        .rejects.toThrow(CustomError);
    });
  });

  describe('buscarPorId', () => {
    test('deve buscar aula por ID com sucesso', async () => {
      const mockAula = {
        _id: new mongoose.Types.ObjectId(),
        titulo: 'Aula Específica',
        conteudoURL: 'http://especifica.com',
        cargaHoraria: 1
      };
      
      aulaService.repositoryAula.buscarPorId.mockResolvedValue(mockAula);

      const result = await aulaService.buscarPorId({ params: { id: mockAula._id } });
      expect(result).toEqual(mockAula);
      expect(aulaService.repositoryAula.buscarPorId).toHaveBeenCalledWith(mockAula._id);
    });

    test('deve lançar erro quando aula não encontrada', async () => {
  const idInexistente = new mongoose.Types.ObjectId();
  aulaService.repositoryAula.buscarPorId.mockResolvedValue(null);

  await expect(aulaService.buscarPorId({ params: { id: idInexistente } }))
    .rejects.toMatchObject({
      customMessage: 'Aula não encontrada',
      statusCode: { code: 404 }
    });
});
  });

  describe('atualizar', () => {
    test('deve atualizar uma aula com sucesso', async () => {
      const mockAulaId = new mongoose.Types.ObjectId();
      const dadosAtualizados = { titulo: 'Aula Atualizada' };
      const aulaAtualizada = { ...dadosAtualizados, _id: mockAulaId };

      aulaService.repositoryAula.buscarPorId.mockResolvedValue({ _id: mockAulaId });
      aulaService.repositoryAula.atualizar.mockResolvedValue(aulaAtualizada);

      const result = await aulaService.atualizar({
        params: { id: mockAulaId },
        body: dadosAtualizados
      });

      expect(result).toEqual(aulaAtualizada);
      expect(aulaService.repositoryAula.buscarPorId).toHaveBeenCalledWith(mockAulaId);
      expect(aulaService.repositoryAula.atualizar).toHaveBeenCalledWith(mockAulaId, dadosAtualizados);
    });

    test('deve lançar erro ao atualizar aula inexistente', async () => {
      const idInexistente = new mongoose.Types.ObjectId();
      aulaService.repositoryAula.buscarPorId.mockResolvedValue(null);

      await expect(aulaService.atualizar({
        params: { id: idInexistente },
        body: { titulo: 'Título Atualizado' }
      })).rejects.toThrow(CustomError);
    });
  });

  describe('deletar', () => {
    test('deve deletar uma aula com sucesso', async () => {
      const mockAulaId = new mongoose.Types.ObjectId();
      const aulaDeletada = { _id: mockAulaId, titulo: 'Aula Deletada' };

      aulaService.repositoryAula.buscarPorId.mockResolvedValue(aulaDeletada);
      aulaService.repositoryAula.deletar.mockResolvedValue(aulaDeletada);

      const result = await aulaService.deletar({ params: { id: mockAulaId } });
      expect(result).toEqual(aulaDeletada);
      expect(aulaService.repositoryAula.buscarPorId).toHaveBeenCalledWith(mockAulaId);
      expect(aulaService.repositoryAula.deletar).toHaveBeenCalledWith(mockAulaId);
    });

    test('deve lançar erro ao deletar aula inexistente', async () => {
      const idInexistente = new mongoose.Types.ObjectId();
      aulaService.repositoryAula.buscarPorId.mockResolvedValue(null);

      await expect(aulaService.deletar({ params: { id: idInexistente } }))
        .rejects.toThrow(CustomError);
    });
  });
});