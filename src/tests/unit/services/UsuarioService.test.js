import UsuarioService from '../../../services/UsuarioService.js';
import UsuarioRepository from '../../../repositories/UsuarioRepository.js';
import CursoRepository from '../../../repositories/CursoRepository.js';
import CertificadoRepository from '../../../repositories/CertificadoRepository.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { CustomError, HttpStatusCodes, messages } from '../../../utils/helpers/index.js';

jest.mock('../../../repositories/UsuarioRepository.js');
jest.mock('../../../repositories/CursoRepository.js');
jest.mock('../../../repositories/CertificadoRepository.js');
jest.mock('bcrypt');
jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose');
    return {
        ...actualMongoose,
        startSession: jest.fn()
    };
});

const usuarioId = '507f1f77bcf86cd799439011';
const usuarioBase = {
    _id: usuarioId,
    nome: 'Usuário Teste',
    email: 'teste@teste.com',
    senha: 'Senha@123',
    ehAdmin: false,
    ativo: false,
    progresso: [],
    toObject: function () { return { ...this }; }
};

let service;
let repository;
let cursoRepository;
let certificadoRepository;

beforeEach(() => {
    UsuarioRepository.mockClear();
    CursoRepository.mockClear();
    CertificadoRepository.mockClear();
    repository = new UsuarioRepository();
    cursoRepository = new CursoRepository();
    certificadoRepository = new CertificadoRepository();
    service = new UsuarioService();
    service.repository = repository;
    service.cursoRepository = cursoRepository;
    service.certificadoRepository = certificadoRepository;
});

describe('UsuarioService', () => {
    describe('listar', () => {
        it('deve listar usuários usando o repository', async () => {
            repository.listar.mockResolvedValue({ docs: [usuarioBase], totalDocs: 1 });
            const req = { query: {}, params: {} };
            const result = await service.listar(req);
            expect(repository.listar).toHaveBeenCalledWith(req);
            expect(result.docs[0].nome).toBe('Usuário Teste');
        });
    });

    describe('criar', () => {
        it('deve criar usuário válido com senha criptografada', async () => {
            repository.buscarPorEmail.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('senhaCriptografada');
            repository.criar.mockResolvedValue({ ...usuarioBase, senha: 'senhaCriptografada' });
            const result = await service.criar({ ...usuarioBase });
            expect(repository.criar).toHaveBeenCalledWith(expect.objectContaining({ senha: 'senhaCriptografada' }));
            expect(result.senha).toBe('senhaCriptografada');
        });
        it('deve lançar erro se e-mail já existe', async () => {
            repository.buscarPorEmail.mockResolvedValue(usuarioBase);
            await expect(service.criar({ ...usuarioBase })).rejects.toThrow('Email já está em uso.');
        });
        it('deve criar usuário sem senha (senha vazia)', async () => {
            const parsedDataSemSenha = { nome: 'Teste', email: 'teste@teste.com' };
            repository.buscarPorEmail.mockResolvedValue(null);
            repository.criar.mockResolvedValue(usuarioBase);
            bcrypt.hash.mockClear(); // Limpar mock antes do teste

            const result = await service.criar(parsedDataSemSenha);

            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(repository.criar).toHaveBeenCalledWith(parsedDataSemSenha);
            expect(result).toEqual(usuarioBase);
        });
    });

    describe('atualizar', () => {
        it('deve atualizar usuário existente sem alterar email/senha', async () => {
            repository.buscarPorId.mockResolvedValue(usuarioBase);
            repository.atualizar.mockResolvedValue({ ...usuarioBase, nome: 'Novo Nome' });
            const result = await service.atualizar(usuarioId, { nome: 'Novo Nome', email: 'novo@a.com', senha: 'novaSenha' });
            expect(repository.atualizar).toHaveBeenCalledWith(usuarioId, { nome: 'Novo Nome' });
            expect(result.nome).toBe('Novo Nome');
        });
        it('deve lançar erro se usuário não existe', async () => {
            repository.buscarPorId.mockResolvedValue(null);
            await expect(service.atualizar(usuarioId, { nome: 'Novo' })).rejects.toThrow('Usuário não encontrado');
        });
    });

    describe('deletar', () => {
        it('deve deletar usuário existente (soft delete)', async () => {
            repository.buscarPorId.mockResolvedValue(usuarioBase);
            repository.deletar.mockResolvedValue({ ...usuarioBase, ativo: false });
            const result = await service.deletar(usuarioId);
            expect(repository.deletar).toHaveBeenCalledWith(usuarioId);
            expect(result.ativo).toBe(false);
        });
        it('deve lançar erro se usuário não existe', async () => {
            repository.buscarPorId.mockResolvedValue(null);
            await expect(service.deletar(usuarioId)).rejects.toThrow('Usuário não encontrado');
        });
    });

    describe('deletarFisicamente', () => {
        let session;
        beforeEach(() => {
            session = {
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn()
            };
            mongoose.startSession.mockResolvedValue(session);
        });
        afterEach(() => {
            jest.restoreAllMocks();
        });
        it('deve deletar usuário e dependências com sucesso', async () => {
            repository.buscarPorId.mockResolvedValue({ ...usuarioBase, progresso: [] });
            certificadoRepository.deletarPorUsuarioId.mockResolvedValue(2);
            cursoRepository.removerReferenciaUsuario.mockResolvedValue(1);
            repository.deletarFisicamente.mockResolvedValue();
            certificadoRepository.contarPorUsuario.mockResolvedValue(2);
            cursoRepository.buscarPorCriador.mockResolvedValue([]);
            const usuario = { ...usuarioBase, progresso: [] };
            repository.buscarPorId.mockResolvedValue(usuario);
            const result = await service.deletarFisicamente(usuarioId);
            expect(session.commitTransaction).toHaveBeenCalled();
            expect(session.endSession).toHaveBeenCalled();
            expect(result.mensagem).toMatch(/exclu/i);
        });
        it('deve usar estatísticas quando certificados/cursos retornam null/undefined', async () => {
            repository.buscarPorId.mockResolvedValue({ ...usuarioBase, progresso: [] });
            certificadoRepository.deletarPorUsuarioId.mockResolvedValue(null);
            certificadoRepository.contarPorUsuario.mockResolvedValue(5);
            cursoRepository.buscarPorCriador.mockResolvedValue([]);
            cursoRepository.removerReferenciaUsuario.mockResolvedValue(undefined);
            repository.deletarFisicamente.mockResolvedValue();

            const result = await service.deletarFisicamente(usuarioId);

            expect(result.estatisticas.certificadosExcluidos).toBe(5); // usa estatisticas.certificados
            expect(result.estatisticas.cursosAtualizados).toBe(0); // usa estatisticas.cursosComoAutor
            expect(session.commitTransaction).toHaveBeenCalled();
            expect(session.endSession).toHaveBeenCalled();
        });
        it('deve abortar transação e lançar CustomError em erro inesperado', async () => {
            repository.buscarPorId.mockResolvedValue({ ...usuarioBase, progresso: [] });
            certificadoRepository.deletarPorUsuarioId.mockRejectedValue(new Error('Falha certific')); // força erro
            certificadoRepository.contarPorUsuario.mockResolvedValue(2);
            cursoRepository.buscarPorCriador.mockResolvedValue([]);
            await expect(service.deletarFisicamente(usuarioId)).rejects.toThrow('Ocorreu um erro ao excluir o usuário e suas dependências.');
            expect(session.abortTransaction).toHaveBeenCalled();
            expect(session.endSession).toHaveBeenCalled();
        });
        it('deve abortar transação e re-lançar CustomError quando CustomError é lançado', async () => {
            repository.buscarPorId.mockResolvedValue({ ...usuarioBase, progresso: [] });
            certificadoRepository.contarPorUsuario.mockResolvedValue(0);
            cursoRepository.buscarPorCriador.mockResolvedValue([]);
            
            const customError = new CustomError({
                statusCode: 400,
                errorType: 'customError',
                field: 'test',
                details: [],
                customMessage: 'Erro customizado'
            });
            certificadoRepository.deletarPorUsuarioId.mockRejectedValue(customError);
            
            await expect(service.deletarFisicamente(usuarioId)).rejects.toThrow(customError);
            expect(session.abortTransaction).toHaveBeenCalled();
            expect(session.endSession).toHaveBeenCalled();
        });
        it('deve lançar erro se usuário tem progresso significativo', async () => {
            repository.buscarPorId.mockResolvedValue({ ...usuarioBase, progresso: [{ percentual_conclusao: 80 }] });
            await expect(service.deletarFisicamente(usuarioId)).rejects.toThrow('Não é possível excluir o usuário pois possui progresso significativo em cursos. Considere desativá-lo em vez de excluí-lo.');
        });
        it('deve lançar erro se usuário é autor de cursos', async () => {
            repository.buscarPorId.mockResolvedValue({ ...usuarioBase, progresso: [] });
            cursoRepository.buscarPorCriador.mockResolvedValue([{}]);
            await expect(service.deletarFisicamente(usuarioId)).rejects.toThrow('Não é possível excluir o usuário pois é autor de cursos. Considere desativá-lo em vez de excluí-lo.');
        });
    });

    describe('restaurar', () => {
        it('deve restaurar usuário existente', async () => {
            repository.buscarPorId.mockResolvedValue(usuarioBase);
            repository.restaurar.mockResolvedValue({ ...usuarioBase, ativo: true });
            const result = await service.restaurar(usuarioId);
            expect(repository.restaurar).toHaveBeenCalledWith(usuarioId);
            expect(result.ativo).toBe(true);
        });
        it('deve lançar erro se usuário não existe', async () => {
            repository.buscarPorId.mockResolvedValue(null);
            await expect(service.restaurar(usuarioId)).rejects.toThrow('Usuário não encontrado');
        });
    });

    describe('Métodos auxiliares', () => {
        it('validateEmail não lança erro se e-mail não existe', async () => {
            repository.buscarPorEmail.mockResolvedValue(null);
            await expect(service.validateEmail('novo@a.com')).resolves.toBeUndefined();
        });
        it('validateEmail lança erro se e-mail já existe', async () => {
            repository.buscarPorEmail.mockResolvedValue(usuarioBase);
            await expect(service.validateEmail('teste@teste.com')).rejects.toThrow('Email já está em uso.');
        });
        it('ensureUserExists retorna usuário se existe', async () => {
            repository.buscarPorId.mockResolvedValue(usuarioBase);
            const result = await service.ensureUserExists(usuarioId);
            expect(result).toBe(usuarioBase);
        });
        it('ensureUserExists lança erro se não existe', async () => {
            repository.buscarPorId.mockResolvedValue(null);
            await expect(service.ensureUserExists(usuarioId)).rejects.toThrow('Usuário não encontrado');
        });
        it('verificarDependenciasParaExclusao lança erro se houver progresso significativo', async () => {
            repository.buscarPorId.mockResolvedValue({ ...usuarioBase, progresso: [{ percentual_conclusao: 60 }] });
            await expect(service.verificarDependenciasParaExclusao(usuarioId)).rejects.toThrow('Não é possível excluir o usuário pois possui progresso significativo em cursos. Considere desativá-lo em vez de excluí-lo.');
        });
        it('verificarDependenciasParaExclusao lança erro se for autor de cursos', async () => {
            repository.buscarPorId.mockResolvedValue({ ...usuarioBase, progresso: [] });
            cursoRepository.buscarPorCriador.mockResolvedValue([{}]);
            await expect(service.verificarDependenciasParaExclusao(usuarioId)).rejects.toThrow('Não é possível excluir o usuário pois é autor de cursos. Considere desativá-lo em vez de excluí-lo.');
        });
        it('verificarDependenciasParaExclusao retorna estatísticas se não houver dependências', async () => {
            repository.buscarPorId.mockResolvedValue({ ...usuarioBase, progresso: [] });
            cursoRepository.buscarPorCriador.mockResolvedValue([]);
            certificadoRepository.contarPorUsuario.mockResolvedValue(2);
            const result = await service.verificarDependenciasParaExclusao(usuarioId);
            expect(result.certificados).toBe(2);
            expect(result.cursosComoAutor).toBe(0);
        });
        it('verificarDependenciasParaExclusao com usuário sem progresso (null)', async () => {
            repository.buscarPorId.mockResolvedValue({ ...usuarioBase, progresso: null });
            cursoRepository.buscarPorCriador.mockResolvedValue([]);
            certificadoRepository.contarPorUsuario.mockResolvedValue(1);
            
            const result = await service.verificarDependenciasParaExclusao(usuarioId);
            
            expect(result.progressos).toBe(0);
            expect(result.certificados).toBe(1);
            expect(result.cursosComoAutor).toBe(0);
        });
        it('verificarDependenciasParaExclusao com usuário sem progresso (undefined)', async () => {
            const usuarioSemProgresso = { ...usuarioBase };
            delete usuarioSemProgresso.progresso;
            repository.buscarPorId.mockResolvedValue(usuarioSemProgresso);
            cursoRepository.buscarPorCriador.mockResolvedValue([]);
            certificadoRepository.contarPorUsuario.mockResolvedValue(0);
            
            const result = await service.verificarDependenciasParaExclusao(usuarioId);
            
            expect(result.progressos).toBe(0);
            expect(result.certificados).toBe(0);
            expect(result.cursosComoAutor).toBe(0);
        });
        it('verificarDependenciasParaExclusao com progresso menor que 50%', async () => {
            repository.buscarPorId.mockResolvedValue({ 
                ...usuarioBase, 
                progresso: [
                    { percentual_conclusao: 30 },
                    { percentual_conclusao: 45 }
                ]
            });
            cursoRepository.buscarPorCriador.mockResolvedValue([]);
            certificadoRepository.contarPorUsuario.mockResolvedValue(0);
            
            const result = await service.verificarDependenciasParaExclusao(usuarioId);
            
            expect(result.progressos).toBe(2);
            expect(result.certificados).toBe(0);
            expect(result.cursosComoAutor).toBe(0);
        });
        it('verificarDependenciasParaExclusao com certificados null', async () => {
            repository.buscarPorId.mockResolvedValue({ ...usuarioBase, progresso: [] });
            cursoRepository.buscarPorCriador.mockResolvedValue([]);
            certificadoRepository.contarPorUsuario.mockResolvedValue(null);
            
            const result = await service.verificarDependenciasParaExclusao(usuarioId);
            
            expect(result.certificados).toBe(0);
        });
        it('verificarDependenciasParaExclusao com cursos null', async () => {
            repository.buscarPorId.mockResolvedValue({ ...usuarioBase, progresso: [] });
            cursoRepository.buscarPorCriador.mockResolvedValue(null);
            certificadoRepository.contarPorUsuario.mockResolvedValue(1);
            
            const result = await service.verificarDependenciasParaExclusao(usuarioId);
            
            expect(result.cursosComoAutor).toBe(0);
        });
    });
});
