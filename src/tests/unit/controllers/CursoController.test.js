import CursoController from '../../../controllers/CursoController.js';
import CursoService from '../../../services/CursoService.js';
import {
    CursoSchema,
    CursoUpdateSchema
} from '../../../utils/validators/schemas/zod/CursoSchema.js';
import {
    CursoIdSchema,
    CursoQuerySchema
} from '../../../utils/validators/schemas/zod/querys/CursoQuerySchema.js';
import {
    CommonResponse,
    CustomError
} from '../../../utils/helpers/index.js';

jest.mock('../../../services/CursoService.js');
jest.mock('../../../utils/validators/schemas/zod/CursoSchema.js');
jest.mock('../../../utils/validators/schemas/zod/querys/CursoQuerySchema.js');
jest.mock('../../../utils/helpers/index.js', () => {
    const original = jest.requireActual('../../../utils/helpers/index.js');
    class CustomError extends Error {
        constructor({
            customMessage
        }) {
            super(customMessage);
            this.name = 'CustomError';
        }
    }
    return {
        ...original,
        CustomError,
        CommonResponse: {
            success: jest.fn(),
            created: jest.fn()
        }
    };
});

const mockRequest = () => ({
    params: {},
    query: {},
    body: {}
});
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockImplementation(data => {
        res.data = data;
        return res;
    });
    return res;
};

describe('CursoController', () => {
    let controller;
    let service;
    beforeEach(() => {
        CursoService.mockClear();
        controller = new CursoController();
        service = controller.service;
        jest.clearAllMocks();
    });

    describe('listar', () => {
        it('deve listar cursos com sucesso', async () => {
            service.listar.mockResolvedValue({
                docs: [{
                    titulo: 'Curso'
                }],
                totalDocs: 1
            });
            CommonResponse.success.mockImplementation((res, data) => data);
            CursoIdSchema.parse = jest.fn();
            CursoQuerySchema.parse = jest.fn();
            const req = mockRequest();
            const res = mockResponse();
            req.query = {
                titulo: 'Curso'
            };
            await controller.listar(req, res);
            expect(service.listar).toHaveBeenCalledWith(req);
            expect(CommonResponse.success).toHaveBeenCalled();
        });
        it('deve validar id se presente', async () => {
            service.listar.mockResolvedValue({});
            CursoIdSchema.parse = jest.fn();
            const req = mockRequest();
            req.params.id = 'idvalido';
            const res = mockResponse();
            await controller.listar(req, res);
            expect(CursoIdSchema.parse).toHaveBeenCalledWith('idvalido');
        });
        it('deve validar query se presente', async () => {
            service.listar.mockResolvedValue({});
            CursoQuerySchema.parse = jest.fn();
            const req = mockRequest();
            req.query = {
                titulo: 'Curso'
            };
            const res = mockResponse();
            await controller.listar(req, res);
            expect(CursoQuerySchema.parse).toHaveBeenCalledWith(req.query);
        });
        it('deve lançar erro do service', async () => {
            service.listar.mockRejectedValue(new Error('Erro interno'));
            const req = mockRequest();
            const res = mockResponse();
            await expect(controller.listar(req, res)).rejects.toThrow('Erro interno');
        });
    });

    describe('criar', () => {
        it('deve criar curso com sucesso', async () => {
            CursoSchema.parse = jest.fn().mockReturnValue({
                titulo: 'Curso',
                criadoPorId: 'id'
            });
            service.criar.mockResolvedValue({
                _id: 'id',
                titulo: 'Curso'
            });
            CommonResponse.created.mockImplementation((res, data) => data);
            const req = mockRequest();
            req.body = {
                titulo: 'Curso',
                criadoPorId: 'id'
            };
            const res = mockResponse();
            await controller.criar(req, res);
            expect(CursoSchema.parse).toHaveBeenCalledWith(req.body);
            expect(service.criar).toHaveBeenCalled();
            expect(CommonResponse.created).toHaveBeenCalled();
        });
        it('deve lançar erro de validação do schema', async () => {
            CursoSchema.parse = jest.fn(() => {
                throw new Error('Erro de validação');
            });
            const req = mockRequest();
            req.body = {};
            const res = mockResponse();
            await expect(controller.criar(req, res)).rejects.toThrow('Erro de validação');
        });
        it('deve lançar erro do service', async () => {
            CursoSchema.parse = jest.fn().mockReturnValue({
                titulo: 'Curso',
                criadoPorId: 'id'
            });
            service.criar.mockRejectedValue(new Error('Erro interno'));
            const req = mockRequest();
            req.body = {
                titulo: 'Curso',
                criadoPorId: 'id'
            };
            const res = mockResponse();
            await expect(controller.criar(req, res)).rejects.toThrow('Erro interno');
        });
    });

    describe('atualizar', () => {
        it('deve atualizar curso com sucesso', async () => {
            CursoIdSchema.parse = jest.fn();
            CursoUpdateSchema.parse = jest.fn().mockReturnValue({
                descricao: 'Nova'
            });
            service.atualizar.mockResolvedValue({
                _id: 'id',
                descricao: 'Nova'
            });
            CommonResponse.success.mockImplementation((res, data) => data);
            const req = mockRequest();
            req.params.id = 'id';
            req.body = {
                descricao: 'Nova'
            };
            const res = mockResponse();
            await controller.atualizar(req, res);
            expect(CursoIdSchema.parse).toHaveBeenCalledWith('id');
            expect(CursoUpdateSchema.parse).toHaveBeenCalledWith(req.body);
            expect(service.atualizar).toHaveBeenCalledWith('id', {
                descricao: 'Nova'
            });
            expect(CommonResponse.success).toHaveBeenCalled();
        });
        it('deve lançar erro se body vazio', async () => {
            CursoIdSchema.parse = jest.fn();
            CursoUpdateSchema.parse = jest.fn().mockReturnValue({});
            const req = mockRequest();
            req.params.id = 'id';
            req.body = {};
            const res = mockResponse();
            await expect(controller.atualizar(req, res)).rejects.toThrow('Nenhum dado fornecido para atualização.');
        });
        it('deve lançar erro do service', async () => {
            CursoIdSchema.parse = jest.fn();
            CursoUpdateSchema.parse = jest.fn().mockReturnValue({
                descricao: 'Nova'
            });
            service.atualizar.mockRejectedValue(new Error('Erro interno'));
            const req = mockRequest();
            req.params.id = 'id';
            req.body = {
                descricao: 'Nova'
            };
            const res = mockResponse();
            await expect(controller.atualizar(req, res)).rejects.toThrow('Erro interno');
        });
    });

    describe('deletar', () => {
        it('deve deletar curso com sucesso', async () => {
            CursoIdSchema.parse = jest.fn();
            service.deletar.mockResolvedValue({
                _id: 'id',
                status: 'arquivado'
            });
            CommonResponse.success.mockImplementation((res, data) => data);
            const req = mockRequest();
            req.params.id = 'id';
            const res = mockResponse();
            await controller.deletar(req, res);
            expect(CursoIdSchema.parse).toHaveBeenCalledWith('id');
            expect(service.deletar).toHaveBeenCalledWith('id');
            expect(CommonResponse.success).toHaveBeenCalled();
        });
        it('deve lançar erro se id não fornecido', async () => {
            const req = mockRequest();
            const res = mockResponse();
            await expect(controller.deletar(req, res)).rejects.toThrow('ID do curso não fornecido.');
        });
        it('deve lançar erro do service', async () => {
            CursoIdSchema.parse = jest.fn();
            service.deletar.mockRejectedValue(new Error('Erro interno'));
            const req = mockRequest();
            req.params.id = 'id';
            const res = mockResponse();
            await expect(controller.deletar(req, res)).rejects.toThrow('Erro interno');
        });
    });

    describe('restaurar', () => {
        it('deve restaurar curso com sucesso', async () => {
            CursoIdSchema.parse = jest.fn();
            service.restaurar.mockResolvedValue({
                _id: 'id',
                status: 'ativo'
            });
            CommonResponse.success.mockImplementation((res, data) => data);
            const req = mockRequest();
            req.params.id = 'id';
            const res = mockResponse();
            await controller.restaurar(req, res);
            expect(CursoIdSchema.parse).toHaveBeenCalledWith('id');
            expect(service.restaurar).toHaveBeenCalledWith('id');
            expect(CommonResponse.success).toHaveBeenCalled();
        });
        it('deve lançar erro se id não fornecido', async () => {
            const req = mockRequest();
            const res = mockResponse();
            await expect(controller.restaurar(req, res)).rejects.toThrow('ID do curso não fornecido.');
        });
        it('deve lançar erro do service', async () => {
            CursoIdSchema.parse = jest.fn();
            service.restaurar.mockRejectedValue(new Error('Erro interno'));
            const req = mockRequest();
            req.params.id = 'id';
            const res = mockResponse();
            await expect(controller.restaurar(req, res)).rejects.toThrow('Erro interno');
        });
    });

    describe('deletarFisicamente', () => {
        it('deve deletar curso fisicamente com sucesso', async () => {
            CursoIdSchema.parse = jest.fn();
            service.deletarFisicamente.mockResolvedValue({
                _id: 'id'
            });
            CommonResponse.success.mockImplementation((res, data) => data);
            const req = mockRequest();
            req.params.id = 'id';
            const res = mockResponse();
            await controller.deletarFisicamente(req, res);
            expect(CursoIdSchema.parse).toHaveBeenCalledWith('id');
            expect(service.deletarFisicamente).toHaveBeenCalledWith('id');
            expect(CommonResponse.success).toHaveBeenCalled();
        });
        it('deve lançar erro se id não fornecido', async () => {
            const req = mockRequest();
            const res = mockResponse();
            await expect(controller.deletarFisicamente(req, res)).rejects.toThrow('ID do curso não fornecido.');
        });
        it('deve lançar erro do service', async () => {
            CursoIdSchema.parse = jest.fn();
            service.deletarFisicamente.mockRejectedValue(new Error('Erro interno'));
            const req = mockRequest();
            req.params.id = 'id';
            const res = mockResponse();
            await expect(controller.deletarFisicamente(req, res)).rejects.toThrow('Erro interno');
        });
    });
});