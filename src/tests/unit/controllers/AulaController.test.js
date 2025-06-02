import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import AulaController from '../../../controllers/AulaController.js';
import { CommonResponse } from '../../../utils/helpers/index.js';

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

  test('deve listar aulas com sucesso', async () => {
    const req = mockRequest();
    const res = mockResponse();
    
    aulaController.service.listar = jest.fn().mockResolvedValue([{ titulo: 'Aula 1' }]);
    
    await aulaController.listar(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test('deve criar uma aula com sucesso', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.body = {
    titulo: 'Nova Aula',
    conteudoURL: 'http://nova.com',
    cargaHoraria: 2,
    cursoId: new mongoose.Types.ObjectId().toString(),
    criadoPorId: new mongoose.Types.ObjectId().toString()
  };
    
    aulaController.service.criar = jest.fn().mockResolvedValue(req.body);
    
    await aulaController.criar(req, res);
    
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      data: req.body
    }));
  });

  test('deve atualizar uma aula com sucesso', async () => {
    const aulaId = new mongoose.Types.ObjectId();
    const req = mockRequest();
    const res = mockResponse();
    req.params = { id: aulaId.toString() };
    req.body = { titulo: 'Aula Atualizada' };
    
    aulaController.service.atualizar = jest.fn().mockResolvedValue({
      _id: aulaId,
      titulo: 'Aula Atualizada'
    });
    
    await aulaController.atualizar(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test('deve deletar uma aula com sucesso', async () => {
    const aulaId = new mongoose.Types.ObjectId();
    const req = mockRequest();
    const res = mockResponse();
    req.params = { id: aulaId.toString() };
    
    aulaController.service.deletar = jest.fn().mockResolvedValue({
      _id: aulaId,
      titulo: 'Aula Deletada'
    });
    
    await aulaController.deletar(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });
});