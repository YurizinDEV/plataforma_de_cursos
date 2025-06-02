import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import AulaService from '../../../services/AulaService.js';
import Aula from '../../../models/Aula.js';

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
    buscarPorTituloECursoId: jest.fn(),
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
  beforeEach(async () => {
    await Aula.deleteMany({});

    jest.clearAllMocks();
  });

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
    aulaService.repositoryAula.buscarPorTituloECursoId.mockResolvedValue(null);
    aulaService.repositoryAula.criar.mockResolvedValue(aulaData);

    const result = await aulaService.criar({ body: aulaData });
    expect(result).toEqual(aulaData);
    expect(aulaService.cursoRepository.buscarPorId).toHaveBeenCalledWith(aulaData.cursoId);
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
    aulaService.repositoryAula.buscarPorTituloECursoId.mockResolvedValue(true);

    await expect(aulaService.criar({ body: aulaData }))
      .rejects.toMatchObject({
        customMessage: 'Esta aula já existe neste curso',
        statusCode: { code: 409 }
      });
  });

  test('deve listar aulas', async () => {
    const mockAulas = [
      { titulo: 'Aula 1', conteudoURL: 'http://aula1.com', cargaHoraria: 2 },
      { titulo: 'Aula 2', conteudoURL: 'http://aula2.com', cargaHoraria: 3 }
    ];
    
    aulaService.repositoryAula.listar.mockResolvedValue(mockAulas);

    const result = await aulaService.listar({});
    expect(result).toEqual(mockAulas);
  });

  test('deve buscar aula por ID', async () => {
    const mockAula = {
      _id: new mongoose.Types.ObjectId(),
      titulo: 'Aula Específica',
      conteudoURL: 'http://especifica.com',
      cargaHoraria: 1
    };
    
    aulaService.repositoryAula.buscarPorId.mockResolvedValue(mockAula);

    const result = await aulaService.buscarPorId({ params: { id: mockAula._id } });
    expect(result).toEqual(mockAula);
  });

  test('deve atualizar uma aula', async () => {
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
  });

  test('deve deletar uma aula', async () => {
    const mockAulaId = new mongoose.Types.ObjectId();
    const aulaDeletada = { _id: mockAulaId, titulo: 'Aula Deletada' };

    aulaService.repositoryAula.buscarPorId.mockResolvedValue(aulaDeletada);
    aulaService.repositoryAula.deletar.mockResolvedValue(aulaDeletada);

    const result = await aulaService.deletar({ params: { id: mockAulaId } });
    expect(result).toEqual(aulaDeletada);
  });
});