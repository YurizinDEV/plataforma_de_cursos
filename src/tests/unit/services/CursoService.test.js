// src / tests / unit / services / CursoService.test.js
import mongoose from 'mongoose';
import CursoService from '../../../services/CursoService.js';
import CursoRepository from '../../../repositories/CursoRepository.js';
import UsuarioRepository from '../../../repositories/UsuarioRepository.js';
import AulaRepository from '../../../repositories/AulaRepository.js';
import QuestionarioRepository from '../../../repositories/QuestionarioRepository.js';
import CertificadoRepository from '../../../repositories/CertificadoRepository.js';
import {
    CustomError
} from '../../../utils/helpers/index.js';

jest.mock('../../../repositories/CursoRepository.js');
jest.mock('../../../repositories/UsuarioRepository.js');
jest.mock('../../../repositories/AulaRepository.js');
jest.mock('../../../repositories/QuestionarioRepository.js');
jest.mock('../../../repositories/CertificadoRepository.js');

const usuarioId = new mongoose.Types.ObjectId();
const cursoId = new mongoose.Types.ObjectId();
const cursoBase = {
    _id: cursoId,
    titulo: 'Curso Teste',
    criadoPorId: usuarioId,
    cargaHorariaTotal: 10,
    status: 'ativo',
    toObject: function () {
        return this;
    }
};
const usuarioBase = {
    _id: usuarioId,
    nome: 'Usuário',
    email: 'teste@teste.com'
};

let service;
let repository;
let usuarioRepository;
let aulaRepository;
let questionarioRepository;
let certificadoRepository;

beforeEach(() => {
    CursoRepository.mockClear();
    UsuarioRepository.mockClear();
    AulaRepository.mockClear();
    QuestionarioRepository.mockClear();
    CertificadoRepository.mockClear();

    repository = new CursoRepository();
    usuarioRepository = new UsuarioRepository();
    aulaRepository = new AulaRepository();
    questionarioRepository = new QuestionarioRepository();
    certificadoRepository = new CertificadoRepository();

    service = new CursoService();
    service.repository = repository;
    service.usuarioRepository = usuarioRepository;
    service.aulaRepository = aulaRepository;
    service.questionarioRepository = questionarioRepository;
    service.certificadoRepository = certificadoRepository;
});

describe('CursoService', () => {
    describe('listar', () => {
        it('deve listar cursos usando o repository', async () => {
            repository.listar.mockResolvedValue({
                docs: [cursoBase],
                totalDocs: 1
            });
            const req = {
                query: {},
                params: {}
            };
            const result = await service.listar(req);
            expect(repository.listar).toHaveBeenCalledWith(req);
            expect(result.docs[0].titulo).toBe('Curso Teste');
        });
    });

    describe('criar', () => {
        it('deve criar curso válido', async () => {
            usuarioRepository.buscarPorId.mockResolvedValue(usuarioBase);
            repository.buscarPorTitulo.mockResolvedValue(null);
            repository.criar.mockResolvedValue(cursoBase);
            const result = await service.criar({
                titulo: 'Curso Teste',
                criadoPorId: usuarioId
            });
            expect(result).toBe(cursoBase);
        });
        it('deve lançar erro se usuário criador não existe', async () => {
            usuarioRepository.buscarPorId.mockRejectedValue(new Error('not found'));
            await expect(service.criar({
                    titulo: 'Curso Teste',
                    criadoPorId: usuarioId
                }))
                .rejects.toThrow('O usuário especificado como criador não existe.');
        });
        it('deve lançar erro se título já existe', async () => {
            usuarioRepository.buscarPorId.mockResolvedValue(usuarioBase);
            repository.buscarPorTitulo.mockResolvedValue(cursoBase);
            await expect(service.criar({
                    titulo: 'Curso Teste',
                    criadoPorId: usuarioId
                }))
                .rejects.toThrow('Título de curso já está em uso.');
        });
    });

    describe('atualizar', () => {
        it('deve atualizar curso existente', async () => {
            repository.buscarPorId.mockResolvedValue(cursoBase);
            repository.atualizar.mockResolvedValue({
                ...cursoBase,
                descricao: 'Nova'
            });
            const result = await service.atualizar(cursoId, {
                descricao: 'Nova'
            });
            expect(result.descricao).toBe('Nova');
        });
        it('deve lançar erro se curso não existe', async () => {
            repository.buscarPorId.mockResolvedValue(null);
            await expect(service.atualizar(cursoId, {
                    descricao: 'Nova'
                }))
                .rejects.toThrow('Curso não encontrado');
        });
        it('deve validar usuário criador ao atualizar', async () => {
            repository.buscarPorId.mockResolvedValue(cursoBase);
            usuarioRepository.buscarPorId.mockRejectedValue(new Error('not found'));
            await expect(service.atualizar(cursoId, {
                    criadoPorId: usuarioId
                }))
                .rejects.toThrow('O usuário especificado como criador não existe.');
        });
        it('deve validar título ao atualizar', async () => {
            repository.buscarPorId.mockResolvedValue(cursoBase);
            usuarioRepository.buscarPorId.mockResolvedValue(usuarioBase);
            repository.buscarPorTitulo.mockResolvedValue({
                ...cursoBase,
                _id: new mongoose.Types.ObjectId()
            });
            await expect(service.atualizar(cursoId, {
                    titulo: 'Outro'
                }))
                .rejects.toThrow('Título de curso já está em uso.');
        });
    });

    describe('deletar', () => {
        it('deve deletar curso existente (soft delete)', async () => {
            repository.buscarPorId.mockResolvedValue(cursoBase);
            repository.deletar.mockResolvedValue({
                ...cursoBase,
                status: 'arquivado'
            });
            const result = await service.deletar(cursoId);
            expect(result.status).toBe('arquivado');
        });
        it('deve lançar erro se curso não existe', async () => {
            repository.buscarPorId.mockResolvedValue(null);
            await expect(service.deletar(cursoId)).rejects.toThrow('Curso não encontrado');
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
            jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);
        });
        afterEach(() => {
            jest.restoreAllMocks();
        });
        it('deve deletar curso e dependências com sucesso', async () => {
            repository.buscarPorId.mockResolvedValue(cursoBase);
            usuarioRepository.buscarUsuariosComProgressoSignificativo.mockResolvedValue([]);
            repository.enriquecerCurso.mockResolvedValue({
                estatisticas: {
                    totalAulas: 1,
                    totalQuestionarios: 2,
                    totalAlternativas: 3,
                    totalCertificados: 4
                }
            });
            aulaRepository.buscarPorCursoId.mockResolvedValue([{
                _id: 'aula1'
            }]);
            questionarioRepository.deletarPorAulaIds.mockResolvedValue({
                questionariosExcluidos: 2,
                alternativasExcluidas: 3
            });
            aulaRepository.deletarPorCursoId.mockResolvedValue(1);
            certificadoRepository.deletarPorCursoId.mockResolvedValue(4);
            usuarioRepository.removerReferenciaCurso.mockResolvedValue({
                cursosRemovidos: 1,
                progressosRemovidos: 1
            });
            repository.deletarFisicamente.mockResolvedValue();
            const result = await service.deletarFisicamente(cursoId);
            expect(result.mensagem).toMatch(/exclu/i);
            expect(session.commitTransaction).toHaveBeenCalled();
            expect(session.endSession).toHaveBeenCalled();
        });
        it('deve abortar transação e lançar CustomError em erro inesperado', async () => {
            repository.buscarPorId.mockResolvedValue(cursoBase);
            usuarioRepository.buscarUsuariosComProgressoSignificativo.mockResolvedValue([]);
            repository.enriquecerCurso.mockResolvedValue({
                estatisticas: {
                    totalAulas: 1,
                    totalQuestionarios: 2,
                    totalAlternativas: 3,
                    totalCertificados: 4
                }
            });
            aulaRepository.buscarPorCursoId.mockRejectedValue(new Error('Falha aulas'));
            await expect(service.deletarFisicamente(cursoId)).rejects.toThrow('Ocorreu um erro ao excluir o curso e suas dependências.');
            expect(session.abortTransaction).toHaveBeenCalled();
            expect(session.endSession).toHaveBeenCalled();
        });
        it('deve lançar erro de dependência se houver usuários com progresso', async () => {
            repository.buscarPorId.mockResolvedValue(cursoBase);
            usuarioRepository.buscarUsuariosComProgressoSignificativo.mockResolvedValue([usuarioBase]);
            await expect(service.deletarFisicamente(cursoId)).rejects.toThrow('Não é possível excluir o curso pois existem usuários com progresso significativo');
        });
    });

    describe('restaurar', () => {
        it('deve restaurar curso existente', async () => {
            repository.buscarPorId.mockResolvedValue(cursoBase);
            repository.restaurar.mockResolvedValue({
                ...cursoBase,
                status: 'ativo'
            });
            const result = await service.restaurar(cursoId);
            expect(result.status).toBe('ativo');
        });
        it('deve lançar erro se curso não existe', async () => {
            repository.buscarPorId.mockResolvedValue(null);
            await expect(service.restaurar(cursoId)).rejects.toThrow('Curso não encontrado');
        });
    });

    describe('Métodos auxiliares', () => {
        it('validateTitulo não lança erro se título não existe', async () => {
            repository.buscarPorTitulo.mockResolvedValue(null);
            await expect(service.validateTitulo('Novo')).resolves.toBeUndefined();
        });
        it('validateTitulo lança erro se título já existe', async () => {
            repository.buscarPorTitulo.mockResolvedValue(cursoBase);
            await expect(service.validateTitulo('Curso Teste')).rejects.toThrow('Título de curso já está em uso.');
        });
        it('validateTitulo não lança erro se id for igual ao curso existente', async () => {
            repository.buscarPorTitulo.mockResolvedValue(cursoBase);
            await expect(service.validateTitulo('Curso Teste', cursoId)).resolves.toBeUndefined();
        });
        it('ensureCursoExists retorna curso se existe', async () => {
            repository.buscarPorId.mockResolvedValue(cursoBase);
            const result = await service.ensureCursoExists(cursoId);
            expect(result).toBe(cursoBase);
        });
        it('ensureCursoExists lança erro se não existe', async () => {
            repository.buscarPorId.mockResolvedValue(null);
            await expect(service.ensureCursoExists(cursoId)).rejects.toThrow('Curso não encontrado');
        });
        it('validateUsuarioCriador retorna usuário se existe', async () => {
            usuarioRepository.buscarPorId.mockResolvedValue(usuarioBase);
            const result = await service.validateUsuarioCriador(usuarioId);
            expect(result).toBe(usuarioBase);
        });
        it('validateUsuarioCriador lança erro se não existe', async () => {
            usuarioRepository.buscarPorId.mockRejectedValue(new Error('not found'));
            await expect(service.validateUsuarioCriador(usuarioId)).rejects.toThrow('O usuário especificado como criador não existe.');
        });
        it('verificarDependenciasParaExclusao lança erro se houver usuários com progresso', async () => {
            usuarioRepository.buscarUsuariosComProgressoSignificativo.mockResolvedValue([usuarioBase]);
            await expect(service.verificarDependenciasParaExclusao(cursoId)).rejects.toThrow('Não é possível excluir o curso pois existem usuários com progresso significativo');
        });
        it('verificarDependenciasParaExclusao retorna estatísticas se não houver dependências', async () => {
            usuarioRepository.buscarUsuariosComProgressoSignificativo.mockResolvedValue([]);
            repository.buscarPorId.mockResolvedValue(cursoBase);
            repository.enriquecerCurso.mockResolvedValue({
                estatisticas: {
                    totalAulas: 1,
                    totalQuestionarios: 2,
                    totalAlternativas: 3,
                    totalCertificados: 4
                }
            });
            const result = await service.verificarDependenciasParaExclusao(cursoId);
            expect(result).toEqual({
                aulas: 1,
                questionarios: 2,
                alternativas: 3,
                certificados: 4
            });
        });
    });
});