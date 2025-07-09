import UsuarioController from '../../../controllers/UsuarioController.js';
import UsuarioService from '../../../services/UsuarioService.js';
import {
    UsuarioSchema,
    UsuarioUpdateSchema
} from '../../../utils/validators/schemas/zod/UsuarioSchema.js';
import {
    CommonResponse,
    CustomError
} from '../../../utils/helpers/index.js';

jest.mock('../../../services/UsuarioService.js');
jest.mock('../../../utils/validators/schemas/zod/UsuarioSchema.js');
jest.mock('../../../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js', () => ({
    UsuarioIdSchema: {
        parse: jest.fn()
    },
    UsuarioQuerySchema: {
        parseAsync: jest.fn()
    }
}));
jest.mock('../../../utils/helpers/index.js', () => {
    const original = jest.requireActual('../../../utils/helpers/index.js');
    class CustomError extends Error {
        constructor({
            customMessage
        }) {
            super(customMessage);
            this.name = 'CustomError';
            this.customMessage = customMessage;
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


const {
    UsuarioIdSchema,
    UsuarioQuerySchema
} = require('../../../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js');

describe('UsuarioController', () => {
    let controller;
    let service;
    beforeEach(() => {
        jest.clearAllMocks();

        Object.getPrototypeOf(UsuarioIdSchema).parse = UsuarioIdSchema.parse;
        controller = new UsuarioController();
        service = controller.service;
    });

    describe('listar', () => {
        it('deve listar usuários com sucesso', async () => {
            service.listar.mockResolvedValue({
                docs: [{
                    nome: 'Usuário'
                }],
                totalDocs: 1
            });
            CommonResponse.success.mockImplementation((res, data) => data);
            UsuarioQuerySchema.parseAsync = jest.fn();
            const req = mockRequest();
            req.query = {
                nome: 'Usuário'
            };
            const res = mockResponse();
            await controller.listar(req, res);
            expect(service.listar).toHaveBeenCalledWith(req);
            expect(CommonResponse.success).toHaveBeenCalled();
        });
        it('deve validar id se presente', async () => {
            service.listar.mockResolvedValue({});
            const req = mockRequest();
            req.params.id = 'idvalido';
            const res = mockResponse();
            await controller.listar(req, res);
            expect(UsuarioIdSchema.parse).toHaveBeenCalledWith('idvalido');
        });
        it('deve validar query se presente', async () => {
            service.listar.mockResolvedValue({});
            UsuarioQuerySchema.parseAsync = jest.fn();
            const req = mockRequest();
            req.query = {
                nome: 'Usuário'
            };
            const res = mockResponse();
            await controller.listar(req, res);
            expect(UsuarioQuerySchema.parseAsync).toHaveBeenCalledWith(req.query);
        });
        it('deve pular validação se query vazia', async () => {
            service.listar.mockResolvedValue({});
            UsuarioQuerySchema.parseAsync = jest.fn();
            const req = mockRequest();
            req.query = {};
            const res = mockResponse();
            await controller.listar(req, res);
            expect(UsuarioQuerySchema.parseAsync).not.toHaveBeenCalled();
        });
        it('deve lançar erro do service', async () => {
            service.listar.mockRejectedValue(new Error('Erro interno'));
            const req = mockRequest();
            const res = mockResponse();
            await expect(controller.listar(req, res)).rejects.toThrow('Erro interno');
        });
        it('deve listar sem validar id quando params é undefined', async () => {
            service.listar.mockResolvedValue({
                docs: [],
                totalDocs: 0
            });
            CommonResponse.success.mockImplementation((res, data) => data);
            const req = mockRequest();
            delete req.params;
            const res = mockResponse();
            await controller.listar(req, res);
            expect(UsuarioIdSchema.parse).not.toHaveBeenCalled();
            expect(service.listar).toHaveBeenCalledWith(req);
        });
        it('deve listar sem validar id quando params.id é undefined', async () => {
            service.listar.mockResolvedValue({
                docs: [],
                totalDocs: 0
            });
            CommonResponse.success.mockImplementation((res, data) => data);
            const req = mockRequest();
            req.params = {};
            const res = mockResponse();
            await controller.listar(req, res);
            expect(UsuarioIdSchema.parse).not.toHaveBeenCalled();
            expect(service.listar).toHaveBeenCalledWith(req);
        });
    });

    describe('criar', () => {
        it('deve criar usuário com sucesso', async () => {
            UsuarioSchema.parse = jest.fn().mockReturnValue({
                nome: 'Usuário',
                email: 'a@a.com',
                senha: 'Senha@123'
            });
            service.criar.mockResolvedValue({
                toObject: () => ({
                    nome: 'Usuário',
                    email: 'a@a.com',
                    ehAdmin: false,
                    ativo: false
                })
            });
            CommonResponse.created.mockImplementation((res, data) => data);
            const req = mockRequest();
            req.body = {
                nome: 'Usuário',
                email: 'a@a.com',
                senha: 'Senha@123'
            };
            const res = mockResponse();
            await controller.criar(req, res);
            expect(UsuarioSchema.parse).toHaveBeenCalledWith(req.body);
            expect(service.criar).toHaveBeenCalled();
            expect(CommonResponse.created).toHaveBeenCalled();
        });
        it('deve lançar erro de validação do schema', async () => {
            UsuarioSchema.parse = jest.fn(() => {
                throw new Error('Erro de validação');
            });
            const req = mockRequest();
            req.body = {};
            const res = mockResponse();
            await expect(controller.criar(req, res)).rejects.toThrow('Erro de validação');
        });
        it('deve lançar erro do service', async () => {
            UsuarioSchema.parse = jest.fn().mockReturnValue({
                nome: 'Usuário',
                email: 'a@a.com',
                senha: 'Senha@123'
            });
            service.criar.mockRejectedValue(new Error('Erro interno'));
            const req = mockRequest();
            req.body = {
                nome: 'Usuário',
                email: 'a@a.com',
                senha: 'Senha@123'
            };
            const res = mockResponse();
            await expect(controller.criar(req, res)).rejects.toThrow('Erro interno');
        });
    });

    describe('atualizar', () => {
        it('deve atualizar usuário com sucesso', async () => {
            UsuarioUpdateSchema.parse = jest.fn().mockReturnValue({
                nome: 'Novo Nome'
            });
            service.atualizar.mockResolvedValue({
                toObject: () => ({
                    nome: 'Novo Nome',
                    email: 'a@a.com'
                })
            });
            CommonResponse.success.mockImplementation((res, data) => data);
            const req = mockRequest();
            req.params.id = 'id';
            req.body = {
                nome: 'Novo Nome'
            };
            const res = mockResponse();
            await controller.atualizar(req, res);
            expect(UsuarioIdSchema.parse).toHaveBeenCalledWith('id');
            expect(UsuarioUpdateSchema.parse).toHaveBeenCalledWith(req.body);
            expect(service.atualizar).toHaveBeenCalledWith('id', {
                nome: 'Novo Nome'
            });
            expect(CommonResponse.success).toHaveBeenCalled();
        });
        it('deve lançar erro se body vazio', async () => {
            UsuarioUpdateSchema.parse = jest.fn(() => {
                throw new Error('Nenhum dado fornecido para atualização.');
            });
            const req = mockRequest();
            req.params.id = 'id';
            req.body = {};
            const res = mockResponse();
            await expect(controller.atualizar(req, res)).rejects.toThrow('Nenhum dado fornecido para atualização.');
        });
        it('deve lançar erro do service', async () => {
            UsuarioUpdateSchema.parse = jest.fn().mockReturnValue({
                nome: 'Novo Nome'
            });
            service.atualizar.mockRejectedValue(new Error('Erro interno'));
            const req = mockRequest();
            req.params.id = 'id';
            req.body = {
                nome: 'Novo Nome'
            };
            const res = mockResponse();
            await expect(controller.atualizar(req, res)).rejects.toThrow('Erro interno');
        });
    });

    describe('deletar', () => {
        it('deve deletar usuário com sucesso', async () => {
            service.deletar.mockResolvedValue({
                toObject: () => ({
                    nome: 'Usuário',
                    email: 'a@a.com',
                    ativo: false
                })
            });
            CommonResponse.success.mockImplementation((res, data) => data);
            const req = mockRequest();
            req.params.id = 'id';
            const res = mockResponse();
            await controller.deletar(req, res);

            expect(service.deletar).toHaveBeenCalledWith('id');
            expect(CommonResponse.success).toHaveBeenCalled();
        });
        it('deve deletar um usuário existente com sucesso', async () => {
            service.deletar.mockResolvedValue({
                toObject: () => ({
                    nome: 'Usuário',
                    email: 'a@a.com',
                    ativo: false
                })
            });
            CommonResponse.success.mockImplementation((res, data, statusCode, message) => {
                res.status(statusCode || 200);
                res.json({
                    data,
                    message
                });
                return {
                    data,
                    message
                };
            });
            const req = mockRequest();
            req.params.id = 'id';
            const res = mockResponse();
            await controller.deletar(req, res);

            expect(service.deletar).toHaveBeenCalledWith('id');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalled();
            expect(res.data.message).toContain('desativado com sucesso');
        });
        it('deve lançar erro se id não fornecido', async () => {
            const req = mockRequest();
            const res = mockResponse();
            await expect(controller.deletar(req, res)).rejects.toThrow('ID do usuário é obrigatório para deletar.');
        });
        it('deve lançar erro do service', async () => {

            service.deletar.mockRejectedValue(new Error('Erro interno'));
            const req = mockRequest();
            req.params.id = 'id';
            const res = mockResponse();
            await expect(controller.deletar(req, res)).rejects.toThrow('Erro interno');
        });
        it('deve lançar erro quando params é undefined', async () => {
            const req = mockRequest();
            delete req.params;
            const res = mockResponse();
            await expect(controller.deletar(req, res)).rejects.toThrow('ID do usuário é obrigatório para deletar.');
        });
    });

    describe('restaurar', () => {
        it('deve restaurar usuário com sucesso', async () => {
            service.restaurar.mockResolvedValue({
                toObject: () => ({
                    nome: 'Usuário',
                    email: 'a@a.com',
                    ativo: true
                })
            });
            CommonResponse.success.mockImplementation((res, data) => data);
            const req = mockRequest();
            req.params.id = 'id';
            const res = mockResponse();
            await controller.restaurar(req, res);
            expect(UsuarioIdSchema.parse).toHaveBeenCalledWith('id');
            expect(service.restaurar).toHaveBeenCalledWith('id');
            expect(CommonResponse.success).toHaveBeenCalled();
        });
        it('deve lançar erro se id não fornecido', async () => {
            const req = mockRequest();
            const res = mockResponse();
            await expect(controller.restaurar(req, res)).rejects.toThrow('ID do usuário não fornecido');
        });
        it('deve lançar erro do service', async () => {
            service.restaurar.mockRejectedValue(new Error('Erro interno'));
            const req = mockRequest();
            req.params.id = 'id';
            const res = mockResponse();
            await expect(controller.restaurar(req, res)).rejects.toThrow('Erro interno');
        });
        it('deve lançar erro quando params é undefined', async () => {
            const req = mockRequest();
            delete req.params;
            const res = mockResponse();
            await expect(controller.restaurar(req, res)).rejects.toThrow('ID do usuário não fornecido');
        });
    });

    describe('deletarFisicamente', () => {
        it('deve remover usuário fisicamente com sucesso', async () => {
            service.deletarFisicamente.mockResolvedValue({});
            CommonResponse.success.mockImplementation((res, data) => data);
            const req = mockRequest();
            req.params.id = 'id';
            const res = mockResponse();
            await controller.deletarFisicamente(req, res);
            expect(UsuarioIdSchema.parse).toHaveBeenCalledWith('id');
            expect(service.deletarFisicamente).toHaveBeenCalledWith('id');
            expect(CommonResponse.success).toHaveBeenCalled();
        });
        it('deve lançar erro se id não fornecido', async () => {
            const req = mockRequest();
            const res = mockResponse();
            await expect(controller.deletarFisicamente(req, res)).rejects.toThrow('ID do usuário não fornecido');
        });
        it('deve lançar erro do service', async () => {
            service.deletarFisicamente.mockRejectedValue(new Error('Erro interno'));
            const req = mockRequest();
            req.params.id = 'id';
            const res = mockResponse();
            await expect(controller.deletarFisicamente(req, res)).rejects.toThrow('Erro interno');
        });
        it('deve lançar erro quando params é undefined', async () => {
            const req = mockRequest();
            delete req.params;
            const res = mockResponse();
            await expect(controller.deletarFisicamente(req, res)).rejects.toThrow('ID do usuário não fornecido');
        });
    });
});