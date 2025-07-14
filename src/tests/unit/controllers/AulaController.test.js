// src/tests/unit/controllers/AulaController.test.js
import AulaController from '../../../../src/controllers/AulaController.js';
import AulaService from '../../../../src/services/AulaService.js';
import { HttpStatusCodes } from '../../../../src/utils/helpers/index.js';

jest.mock('../../../../src/services/AulaService.js');

describe('AulaController', () => {
  let controller;
  let req;
  let res;

  const validObjectId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    controller = new AulaController();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('listar() deve retornar dados com sucesso', async () => {
    req.query = {};
    req.params = { id: validObjectId }; // Corrigido aqui também, pois o controller tenta validar `params.id`
    const data = [{ titulo: 'Aula 1' }];
    AulaService.prototype.listar.mockResolvedValue(data);

    await controller.listar(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data }));
  });

  it('criar() deve criar aula com sucesso', async () => {
    req.body = {
      titulo: 'Nova Aula',
      conteudoURL: 'https://example.com',
      cargaHoraria: 1,
      cursoId: validObjectId,
      criadoPorId: '507f1f77bcf86cd799439012',
    };
    const data = { ...req.body, _id: 'abc123' };
    AulaService.prototype.criar.mockResolvedValue(data);

    await controller.criar(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data }));
  });

  it('acessar() deve retornar uma aula', async () => {
    req.params = { id: validObjectId };
    const data = { titulo: 'Aula 1' };
    AulaService.prototype.listar.mockResolvedValue(data);

    await controller.acessar(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data }));
  });

  it('atualizar() deve atualizar e retornar aula', async () => {
    req.params = { id: validObjectId };
    req.body = { titulo: 'Atualizada' };
    const data = { _id: validObjectId, titulo: 'Atualizada' };
    AulaService.prototype.atualizar.mockResolvedValue(data);

    await controller.atualizar(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK.code);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data }));
  });

  it('deletar() deve remover aula com sucesso', async () => {
    req.params = { id: validObjectId };
    const data = { _id: validObjectId, titulo: 'Removida' };
    AulaService.prototype.deletar.mockResolvedValue(data);

    await controller.deletar(req, res);
    expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.OK.code);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data }));
  });
});
