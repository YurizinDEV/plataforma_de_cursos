import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import AulaController from '../../../controllers/AulaController.js';
import { CommonResponse } from '../../../utils/helpers/index.js';
import { ZodError } from 'zod';

let mongoServer;
let aulaController;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  aulaController = new AulaController();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('AulaController', () => {
  const mockRequest = () => ({
    params: {},
    query: {},
    body: {}
  });

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listar', () => {
    test('deve listar aulas com sucesso sem parâmetros', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      const mockData = [{ titulo: 'Aula 1' }];
      aulaController.service.listar = jest.fn().mockResolvedValue(mockData);
      
      await aulaController.listar(req, res);
      
      expect(aulaController.service.listar).toHaveBeenCalledWith(req);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: mockData
      }));
    });

    test('deve listar aulas com sucesso com id nos params', async () => {
      const aulaId = new mongoose.Types.ObjectId();
      const req = mockRequest();
      req.params = { id: aulaId.toString() };
      const res = mockResponse();
      
      const mockData = { _id: aulaId, titulo: 'Aula 1' };
      aulaController.service.listar = jest.fn().mockResolvedValue(mockData);
      
      await aulaController.listar(req, res);
      
      expect(aulaController.service.listar).toHaveBeenCalledWith(req);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: mockData
      }));
    });

    test('deve listar aulas com sucesso com query params', async () => {
      const req = mockRequest();
      req.query = { cursoId: new mongoose.Types.ObjectId().toString() };
      const res = mockResponse();
      
      const mockData = [{ titulo: 'Aula 1' }];
      aulaController.service.listar = jest.fn().mockResolvedValue(mockData);
      
      await aulaController.listar(req, res);
      
      expect(aulaController.service.listar).toHaveBeenCalledWith(req);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: mockData
      }));
    });

    test('deve listar aulas sem validar id quando id não está presente', async () => {
    const req = mockRequest();
    const res = mockResponse();
    
    const mockData = [{ titulo: 'Aula 1' }];
    aulaController.service.listar = jest.fn().mockResolvedValue(mockData);
    
    await aulaController.listar(req, res);
    
    expect(aulaController.service.listar).toHaveBeenCalledWith(req);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('deve listar aulas sem validar query quando query está vazia', async () => {
    const req = mockRequest();
    req.query = {};
    const res = mockResponse();
    
    const mockData = [{ titulo: 'Aula 1' }];
    aulaController.service.listar = jest.fn().mockResolvedValue(mockData);
    
    await aulaController.listar(req, res);
    
    expect(aulaController.service.listar).toHaveBeenCalledWith(req);
    expect(res.status).toHaveBeenCalledWith(200);
  });

    test('deve lançar erro quando id é inválido', async () => {
      const req = mockRequest();
      req.params = { id: 'id-invalido' };
      const res = mockResponse();
      
      await expect(aulaController.listar(req, res)).rejects.toThrow(ZodError);
    });
  });

  describe('criar', () => {
  test('deve criar uma aula com sucesso', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const requestBody = {
      titulo: 'Nova Aula',
      conteudoURL: 'http://nova.com',
      cargaHoraria: 2,
      cursoId: new mongoose.Types.ObjectId().toString(),
      criadoPorId: new mongoose.Types.ObjectId().toString()
    };
    req.body = requestBody;
    

    const responseBody = {
      ...requestBody,
      materialComplementar: []
    };
    aulaController.service.criar = jest.fn().mockResolvedValue(responseBody);
    
    await aulaController.criar(req, res);
    
    expect(aulaController.service.criar).toHaveBeenCalledWith({
      body: expect.objectContaining(requestBody)
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      data: responseBody
    }));
  });

    test('deve lançar erro quando dados são inválidos', async () => {
      const req = mockRequest();
      req.body = { titulo: '' }; // Dados inválidos
      const res = mockResponse();
      
      await expect(aulaController.criar(req, res)).rejects.toThrow(ZodError);
    });
  });

  describe('acessar', () => {
    test('deve acessar uma aula com sucesso', async () => {
      const aulaId = new mongoose.Types.ObjectId();
      const req = mockRequest();
      req.params = { id: aulaId.toString() };
      const res = mockResponse();
      
      const mockData = { _id: aulaId, titulo: 'Aula 1' };
      aulaController.service.listar = jest.fn().mockResolvedValue(mockData);
      
      await aulaController.acessar(req, res);
      
      expect(aulaController.service.listar).toHaveBeenCalledWith({ params: { id: aulaId.toString() } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: mockData
      }));
    });

    test('deve lançar erro quando id é inválido', async () => {
      const req = mockRequest();
      req.params = { id: 'id-invalido' };
      const res = mockResponse();
      
      await expect(aulaController.acessar(req, res)).rejects.toThrow(ZodError);
    });
  });

  describe('atualizar', () => {
    test('deve atualizar uma aula com sucesso', async () => {
      const aulaId = new mongoose.Types.ObjectId();
      const req = mockRequest();
      req.params = { id: aulaId.toString() };
      req.body = { titulo: 'Aula Atualizada' };
      const res = mockResponse();
      
      const mockData = { _id: aulaId, titulo: 'Aula Atualizada' };
      aulaController.service.atualizar = jest.fn().mockResolvedValue(mockData);
      
      await aulaController.atualizar(req, res);
      
      expect(aulaController.service.atualizar).toHaveBeenCalledWith({
        params: { id: aulaId.toString() },
        body: req.body
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: mockData,
        message: expect.any(String)
      }));
    });

    test('deve lançar erro quando id é inválido', async () => {
      const req = mockRequest();
      req.params = { id: 'id-invalido' };
      req.body = { titulo: 'Aula Atualizada' };
      const res = mockResponse();
      
      await expect(aulaController.atualizar(req, res)).rejects.toThrow(ZodError);
    });

    test('deve lançar erro quando dados são inválidos', async () => {
      const aulaId = new mongoose.Types.ObjectId();
      const req = mockRequest();
      req.params = { id: aulaId.toString() };
      req.body = { titulo: '' }; // Dados inválidos
      const res = mockResponse();
      
      await expect(aulaController.atualizar(req, res)).rejects.toThrow(ZodError);
    });
  });

  describe('deletar', () => {
    test('deve deletar uma aula com sucesso', async () => {
      const aulaId = new mongoose.Types.ObjectId();
      const req = mockRequest();
      req.params = { id: aulaId.toString() };
      const res = mockResponse();
      
      const mockData = { _id: aulaId, titulo: 'Aula Deletada' };
      aulaController.service.deletar = jest.fn().mockResolvedValue(mockData);
      
      await aulaController.deletar(req, res);
      
      expect(aulaController.service.deletar).toHaveBeenCalledWith({ params: { id: aulaId.toString() } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: {
          id: mockData._id,
          titulo: mockData.titulo,
          mensagem: expect.any(String)
        },
        message: expect.any(String)
      }));
    });

    test('deve lançar erro quando id é inválido', async () => {
      const req = mockRequest();
      req.params = { id: 'id-invalido' };
      const res = mockResponse();
      
      await expect(aulaController.deletar(req, res)).rejects.toThrow(ZodError);
    });
  });
});