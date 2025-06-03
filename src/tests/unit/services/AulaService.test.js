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
    jest.clearAllMocks(); // Limpa todos os mocks antes de cada teste
  });

  // Testes para o método criar
  describe('criar', () => {
    test('deve criar uma aula com curso valido', async () => {
      // Configuração: Mock do curso e dados da aula
      const mockCursoId = new mongoose.Types.ObjectId();
      const aulaData = {
        titulo: 'Nova Aula',
        conteudoURL: 'http://nova.com',
        cargaHoraria: 2,
        cursoId: mockCursoId,
        criadoPorId: new mongoose.Types.ObjectId()
      };

      // Mock dos repositórios
      aulaService.cursoRepository.buscarPorId.mockResolvedValue({ _id: mockCursoId });
      aulaService.repositoryAula.buscarPorTitulo.mockResolvedValue(null);
      aulaService.repositoryAula.criar.mockResolvedValue(aulaData);

      // Execução: Chama o método criar
      const result = await aulaService.criar({ body: aulaData });

      // Verificações:
      // 1. Verifica se retornou os dados corretos da aula
      expect(result).toEqual(aulaData);
      // 2. Verifica se verificou a existência do curso
      expect(aulaService.cursoRepository.buscarPorId).toHaveBeenCalledWith(aulaData.cursoId);
      // 3. Verifica se verificou se o título já existe no curso
      expect(aulaService.repositoryAula.buscarPorTitulo).toHaveBeenCalledWith(aulaData.titulo, aulaData.cursoId);
      // 4. Verifica se chamou o método criar com os dados corretos
      expect(aulaService.repositoryAula.criar).toHaveBeenCalledWith(aulaData);
    });

    test('deve falhar ao criar aula com curso inexistente', async () => {
      // Configuração: Dados de aula com curso não existente
      const aulaData = {
        titulo: 'Aula sem Curso',
        conteudoURL: 'http://semcurso.com',
        cargaHoraria: 1,
        cursoId: new mongoose.Types.ObjectId(),
        criadoPorId: new mongoose.Types.ObjectId()
      };

      // Mock do repositório para retornar curso não encontrado
      aulaService.cursoRepository.buscarPorId.mockResolvedValue(null);

      // Execução e Verificação:
      // Verifica se rejeita com o erro esperado
      await expect(aulaService.criar({ body: aulaData }))
        .rejects.toMatchObject({
          customMessage: 'Curso não encontrado',
          statusCode: { code: 404 }
        });
    });

    test('deve falhar ao criar aula duplicada no mesmo curso', async () => {
      // Configuração: Dados de aula que já existe
      const mockCursoId = new mongoose.Types.ObjectId();
      const aulaData = {
        titulo: 'Aula Duplicada',
        conteudoURL: 'http://duplicada.com',
        cargaHoraria: 3,
        cursoId: mockCursoId,
        criadoPorId: new mongoose.Types.ObjectId()
      };

      // Mock dos repositórios
      aulaService.cursoRepository.buscarPorId.mockResolvedValue({ _id: mockCursoId });
      aulaService.repositoryAula.buscarPorTitulo.mockResolvedValue({ _id: new mongoose.Types.ObjectId() });

      // Execução e Verificação:
      // Verifica se rejeita com o erro esperado
      await expect(aulaService.criar({ body: aulaData }))
        .rejects.toMatchObject({
          customMessage: 'Esta aula já existe neste curso',
          statusCode: { code: 409 }
        });
    });
  });

  // Testes para o método listar
  describe('listar', () => {
    test('deve listar todas as aulas sem filtros', async () => {
      // Configuração: Mock de lista de aulas
      const mockAulas = [
        { titulo: 'Aula 1', conteudoURL: 'http://aula1.com', cargaHoraria: 2 },
        { titulo: 'Aula 2', conteudoURL: 'http://aula2.com', cargaHoraria: 3 }
      ];
      
      // Mock do repositório
      aulaService.repositoryAula.listar.mockResolvedValue(mockAulas);

      // Execução: Chama o método listar sem filtros
      const result = await aulaService.listar({ query: {} });

      // Verificações:
      // 1. Verifica se retornou todas as aulas
      expect(result).toEqual(mockAulas);
      // 2. Verifica se chamou o método listar sem parâmetros
      expect(aulaService.repositoryAula.listar).toHaveBeenCalledWith({});
    });

    test('deve listar aulas com filtros', async () => {
      // Configuração: Mock de aulas filtradas por curso
      const cursoId = new mongoose.Types.ObjectId();
      const mockAulas = [
        { titulo: 'Aula Filtrada', conteudoURL: 'http://filtrada.com', cargaHoraria: 2, cursoId }
      ];
      
      // Mock do repositório
      aulaService.repositoryAula.listar.mockResolvedValue(mockAulas);

      // Execução: Chama o método listar com filtro
      const result = await aulaService.listar({ query: { cursoId } });

      // Verificações:
      // 1. Verifica se retornou as aulas filtradas
      expect(result).toEqual(mockAulas);
      // 2. Verifica se chamou o método listar com o filtro correto
      expect(aulaService.repositoryAula.listar).toHaveBeenCalledWith({ cursoId });
    });

    test('deve retornar aula específica quando ID é fornecido', async () => {
      // Configuração: Mock de aula específica
      const mockAula = {
        _id: new mongoose.Types.ObjectId(),
        titulo: 'Aula Específica',
        conteudoURL: 'http://especifica.com',
        cargaHoraria: 1
      };
      
      // Mock do repositório
      aulaService.repositoryAula.buscarPorId.mockResolvedValue(mockAula);

      // Execução: Chama o método listar com ID
      const result = await aulaService.listar({ params: { id: mockAula._id } });

      // Verificações:
      // 1. Verifica se retornou a aula correta
      expect(result).toEqual(mockAula);
      // 2. Verifica se chamou o método buscarPorId com o ID correto
      expect(aulaService.repositoryAula.buscarPorId).toHaveBeenCalledWith(mockAula._id);
    });

    test('deve lançar erro quando aula não encontrada por ID', async () => {
      // Configuração: Mock para aula não encontrada
      const idInexistente = new mongoose.Types.ObjectId();
      aulaService.repositoryAula.buscarPorId.mockResolvedValue(null);

      // Execução e Verificação:
      // Verifica se lança o erro esperado
      await expect(aulaService.listar({ params: { id: idInexistente } }))
        .rejects.toThrow(CustomError);
    });
  });

  // Testes para o método buscarPorId
  describe('buscarPorId', () => {
    test('deve buscar aula por ID com sucesso', async () => {
      // Configuração: Mock de aula específica
      const mockAula = {
        _id: new mongoose.Types.ObjectId(),
        titulo: 'Aula Específica',
        conteudoURL: 'http://especifica.com',
        cargaHoraria: 1
      };
      
      // Mock do repositório
      aulaService.repositoryAula.buscarPorId.mockResolvedValue(mockAula);

      // Execução: Chama o método buscarPorId
      const result = await aulaService.buscarPorId({ params: { id: mockAula._id } });

      // Verificações:
      // 1. Verifica se retornou a aula correta
      expect(result).toEqual(mockAula);
      // 2. Verifica se chamou o método buscarPorId com o ID correto
      expect(aulaService.repositoryAula.buscarPorId).toHaveBeenCalledWith(mockAula._id);
    });

    test('deve lançar erro quando aula não encontrada', async () => {
      // Configuração: Mock para aula não encontrada
      const idInexistente = new mongoose.Types.ObjectId();
      aulaService.repositoryAula.buscarPorId.mockResolvedValue(null);

      // Execução e Verificação:
      // Verifica se lança o erro com as propriedades esperadas
      await expect(aulaService.buscarPorId({ params: { id: idInexistente } }))
        .rejects.toMatchObject({
          customMessage: 'Aula não encontrada',
          statusCode: { code: 404 }
        });
    });
  });

  // Testes para o método atualizar
  describe('atualizar', () => {
    test('deve atualizar uma aula com sucesso', async () => {
      // Configuração: Mock de aula existente e dados de atualização
      const mockAulaId = new mongoose.Types.ObjectId();
      const dadosAtualizados = { titulo: 'Aula Atualizada' };
      const aulaAtualizada = { ...dadosAtualizados, _id: mockAulaId };

      // Mock dos repositórios
      aulaService.repositoryAula.buscarPorId.mockResolvedValue({ _id: mockAulaId });
      aulaService.repositoryAula.atualizar.mockResolvedValue(aulaAtualizada);

      // Execução: Chama o método atualizar
      const result = await aulaService.atualizar({
        params: { id: mockAulaId },
        body: dadosAtualizados
      });

      // Verificações:
      // 1. Verifica se retornou a aula atualizada
      expect(result).toEqual(aulaAtualizada);
      // 2. Verifica se verificou a existência da aula
      expect(aulaService.repositoryAula.buscarPorId).toHaveBeenCalledWith(mockAulaId);
      // 3. Verifica se chamou o método atualizar com os parâmetros corretos
      expect(aulaService.repositoryAula.atualizar).toHaveBeenCalledWith(mockAulaId, dadosAtualizados);
    });

    test('deve lançar erro ao atualizar aula inexistente', async () => {
      // Configuração: Mock para aula não encontrada
      const idInexistente = new mongoose.Types.ObjectId();
      aulaService.repositoryAula.buscarPorId.mockResolvedValue(null);

      // Execução e Verificação:
      // Verifica se lança o erro esperado
      await expect(aulaService.atualizar({
        params: { id: idInexistente },
        body: { titulo: 'Título Atualizado' }
      })).rejects.toThrow(CustomError);
    });
  });

  // Testes para o método deletar
  describe('deletar', () => {
    test('deve deletar uma aula com sucesso', async () => {
      // Configuração: Mock de aula existente
      const mockAulaId = new mongoose.Types.ObjectId();
      const aulaDeletada = { _id: mockAulaId, titulo: 'Aula Deletada' };

      // Mock dos repositórios
      aulaService.repositoryAula.buscarPorId.mockResolvedValue(aulaDeletada);
      aulaService.repositoryAula.deletar.mockResolvedValue(aulaDeletada);

      // Execução: Chama o método deletar
      const result = await aulaService.deletar({ params: { id: mockAulaId } });

      // Verificações:
      // 1. Verifica se retornou a aula deletada
      expect(result).toEqual(aulaDeletada);
      // 2. Verifica se verificou a existência da aula
      expect(aulaService.repositoryAula.buscarPorId).toHaveBeenCalledWith(mockAulaId);
      // 3. Verifica se chamou o método deletar com o ID correto
      expect(aulaService.repositoryAula.deletar).toHaveBeenCalledWith(mockAulaId);
    });

    test('deve lançar erro ao deletar aula inexistente', async () => {
      // Configuração: Mock para aula não encontrada
      const idInexistente = new mongoose.Types.ObjectId();
      aulaService.repositoryAula.buscarPorId.mockResolvedValue(null);

      // Execução e Verificação:
      // Verifica se lança o erro esperado
      await expect(aulaService.deletar({ params: { id: idInexistente } }))
        .rejects.toThrow(CustomError);
    });
  });
});