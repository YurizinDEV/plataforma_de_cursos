//UsuarioService.js
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import CursoRepository from '../repositories/CursoRepository.js';
import CertificadoRepository from '../repositories/CertificadoRepository.js';
import mongoose from 'mongoose';
import {
    CustomError,
    HttpStatusCodes,
    messages
} from '../utils/helpers/index.js';
import bcrypt from 'bcrypt';

class UsuarioService {
    constructor() {
        this.repository = new UsuarioRepository();
        this.cursoRepository = new CursoRepository();
        this.certificadoRepository = new CertificadoRepository();
    }

    async listar(req) {
        const data = await this.repository.listar(req);
        return data;
    }

    async criar(parsedData) {
        await this.validateEmail(parsedData.email);
        if (parsedData.senha) {
            const saltRounds = 10;
            parsedData.senha = await bcrypt.hash(parsedData.senha, saltRounds);
        }
        const data = await this.repository.criar(parsedData);
        return data;
    }

    async atualizar(id, parsedData) {
        delete parsedData.senha;
        delete parsedData.email;
        await this.ensureUserExists(id);
        const data = await this.repository.atualizar(id, parsedData);
        return data;
    }

    async deletar(id) {
        const usuario = await this.ensureUserExists(id);
        return await this.repository.deletar(id);
    }

    async deletarFisicamente(id) {
        const usuario = await this.ensureUserExists(id);


        const estatisticas = await this.verificarDependenciasParaExclusao(id);


        const session = await mongoose.startSession();
        session.startTransaction();

        try {

            const certificadosExcluidos = await this.certificadoRepository.deletarPorUsuarioId(id, {
                session
            });


            const cursosAtualizados = await this.cursoRepository.removerReferenciaUsuario(id, {
                session
            });


            await this.repository.deletarFisicamente(id, {
                session
            });


            await session.commitTransaction();

            return {
                mensagem: 'Usuário e todos os seus recursos relacionados foram excluídos permanentemente.',
                estatisticas: {
                    usuario: usuario.nome,
                    email: usuario.email,
                    certificadosExcluidos: certificadosExcluidos || estatisticas.certificados,
                    cursosAtualizados: cursosAtualizados || estatisticas.cursosComoAutor,
                    progressosRemovidos: estatisticas.progressos
                }
            };
        } catch (error) {

            await session.abortTransaction();

            if (!(error instanceof CustomError)) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                    errorType: 'transactionError',
                    field: 'Usuario',
                    details: [{
                        path: 'exclusão em cascata',
                        message: `Erro ao excluir usuário e dependências: ${error.message}`
                    }],
                    customMessage: 'Ocorreu um erro ao excluir o usuário e suas dependências.'
                });
            }

            throw error;
        } finally {

            session.endSession();
        }
    }

    async restaurar(id) {

        await this.ensureUserExists(id);
        return await this.repository.restaurar(id);
    }






    async validateEmail(email, id = null) {
        const usuarioExistente = await this.repository.buscarPorEmail(email, id);
        if (usuarioExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'email',
                details: [{
                    path: 'email',
                    message: 'Email já está em uso.'
                }],
                customMessage: 'Email já está em uso.',
            });
        }
    }

    async ensureUserExists(id) {
        const usuarioExistente = await this.repository.buscarPorId(id);
        if (!usuarioExistente) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário'),
            });
        }
        return usuarioExistente;
    }

    async verificarDependenciasParaExclusao(usuarioId) {

        const usuario = await this.repository.buscarPorId(usuarioId);

        if (usuario.progresso && usuario.progresso.length > 0) {

            const progressoSignificativo = usuario.progresso.some(p => {
                const percentual = parseFloat(p.percentual_conclusao);
                return percentual >= 50;
            });

            if (progressoSignificativo) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.CONFLICT.code,
                    errorType: 'dependencyConflict',
                    field: 'usuario',
                    details: [{
                        path: 'usuario',
                        message: `O usuário possui progresso significativo em cursos.`
                    }],
                    customMessage: 'Não é possível excluir o usuário pois possui progresso significativo em cursos. Considere desativá-lo em vez de excluí-lo.'
                });
            }
        }


        const cursosComoAutor = await this.cursoRepository.buscarPorCriador(usuarioId);

        if (cursosComoAutor && cursosComoAutor.length > 0) {
            throw new CustomError({
                statusCode: HttpStatusCodes.CONFLICT.code,
                errorType: 'dependencyConflict',
                field: 'usuario',
                details: [{
                    path: 'usuario',
                    message: `O usuário é autor de ${cursosComoAutor.length} curso(s).`
                }],
                customMessage: 'Não é possível excluir o usuário pois é autor de cursos. Considere desativá-lo em vez de excluí-lo.'
            });
        }


        const certificados = await this.certificadoRepository.contarPorUsuario(usuarioId);

        return {
            progressos: usuario.progresso ? usuario.progresso.length : 0,
            certificados: certificados || 0,
            cursosComoAutor: cursosComoAutor ? cursosComoAutor.length : 0
        };
    }
}

export default UsuarioService;