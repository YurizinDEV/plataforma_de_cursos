import CursoRepository from '../repositories/CursoRepository.js';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import AulaRepository from '../repositories/AulaRepository.js';
import QuestionarioRepository from '../repositories/QuestionarioRepository.js';
import CertificadoRepository from '../repositories/CertificadoRepository.js';
import mongoose from 'mongoose';
import {
    CustomError,
    HttpStatusCodes,
    messages
} from '../utils/helpers/index.js';

class CursoService {
    constructor() {
        this.repository = new CursoRepository();
        this.usuarioRepository = new UsuarioRepository();
        this.aulaRepository = new AulaRepository();
        this.questionarioRepository = new QuestionarioRepository();
        this.certificadoRepository = new CertificadoRepository();
    }

    async listar(req) {
        const data = await this.repository.listar(req);
        return data;
    }

    async criar(dadosCurso) {

        await this.validateUsuarioCriador(dadosCurso.criadoPorId);


        await this.validateTitulo(dadosCurso.titulo);

        return await this.repository.criar(dadosCurso);
    }

    async atualizar(id, dadosAtualizados) {
        await this.ensureCursoExists(id);


        if (dadosAtualizados.criadoPorId) {
            await this.validateUsuarioCriador(dadosAtualizados.criadoPorId);
        }

        if (dadosAtualizados.titulo) {
            await this.validateTitulo(dadosAtualizados.titulo, id);
        }
        return await this.repository.atualizar(id, dadosAtualizados);
    }
    async deletar(id) {

        const curso = await this.ensureCursoExists(id);
        return await this.repository.deletar(id);
    }

    async deletarFisicamente(id) {

        const curso = await this.ensureCursoExists(id);


        const estatisticas = await this.verificarDependenciasParaExclusao(id);


        const session = await mongoose.startSession();
        session.startTransaction();

        try {

            const aulas = await this.aulaRepository.buscarPorCursoId(id);
            const aulaIds = aulas.map(a => a._id);


            let resultadoQuestionarios = {
                questionariosExcluidos: 0,
                alternativasExcluidas: 0
            };

            if (aulaIds.length > 0) {
                resultadoQuestionarios = await this.questionarioRepository.deletarPorAulaIds(aulaIds, {
                    session
                });
            }


            const aulasExcluidas = await this.aulaRepository.deletarPorCursoId(id, {
                session
            });


            const certificadosExcluidos = await this.certificadoRepository.deletarPorCursoId(id, {
                session
            });


            const refsRemovidas = await this.usuarioRepository.removerReferenciaCurso(id, {
                session
            });


            await this.repository.deletarFisicamente(id, {
                session
            });


            await session.commitTransaction();
            return {
                mensagem: 'Curso e todos os seus recursos relacionados foram excluídos permanentemente.',
                estatisticas: {
                    curso: curso.titulo,
                    aulasExcluidas: aulasExcluidas || estatisticas.aulas,
                    questionariosExcluidos: resultadoQuestionarios.questionariosExcluidos,
                    alternativasExcluidas: resultadoQuestionarios.alternativasExcluidas || 0,
                    certificadosExcluidos: certificadosExcluidos || estatisticas.certificados,
                    cargaHorariaTotal: this.formatarCargaHoraria(curso.cargaHorariaTotal),
                    referenciasUsuariosRemovidas: refsRemovidas ?
                        `${refsRemovidas.cursosRemovidos} cursosIds, ${refsRemovidas.progressosRemovidos} progressos` : '0'
                }
            };
        } catch (error) {

            await session.abortTransaction();


            if (!(error instanceof CustomError)) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                    errorType: 'transactionError',
                    field: 'Curso',
                    details: [{
                        path: 'exclusão em cascata',
                        message: `Erro ao excluir curso e dependências: ${error.message}`
                    }],
                    customMessage: 'Ocorreu um erro ao excluir o curso e suas dependências.'
                });
            }

            throw error;
        } finally {

            session.endSession();
        }
    }

    async restaurar(id) {

        await this.ensureCursoExists(id);
        return await this.repository.restaurar(id);
    }


    async validateTitulo(titulo, id = null) {
        const cursoExistente = await this.repository.buscarPorTitulo(titulo, {
            throwOnNotFound: false
        });

        if (!cursoExistente) {
            return;
        }

        if (!id || cursoExistente._id.toString() !== id.toString()) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'titulo',
                details: [{
                    path: 'titulo',
                    message: 'Título de curso já está em uso.'
                }],
                customMessage: 'Título de curso já está em uso.',
            });
        }
    }

    async ensureCursoExists(id) {
        const cursoExistente = await this.repository.buscarPorId(id);
        if (!cursoExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Curso',
                details: [],
                customMessage: messages.error.resourceNotFound('Curso'),
            });
        }
        return cursoExistente;
    }

    async validateUsuarioCriador(usuarioId) {
        try {
            return await this.usuarioRepository.buscarPorId(usuarioId);
        } catch (error) {

            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'criadoPorId',
                details: [{
                    path: 'criadoPorId',
                    message: 'O usuário especificado como criador não existe.'
                }],
                customMessage: 'O usuário especificado como criador não existe.'
            });
        }
    }
    async verificarDependenciasParaExclusao(cursoId) {

        const usuariosComProgresso = await this.usuarioRepository.buscarUsuariosComProgressoSignificativo(cursoId);

        if (usuariosComProgresso && usuariosComProgresso.length > 0) {
            throw new CustomError({
                statusCode: HttpStatusCodes.CONFLICT.code,
                errorType: 'dependencyConflict',
                field: 'curso',
                details: [{
                    path: 'curso',
                    message: `O curso possui ${usuariosComProgresso.length} usuário(s) com progresso significativo.`
                }],
                customMessage: 'Não é possível excluir o curso pois existem usuários com progresso significativo. Considere desativá-lo em vez de excluí-lo.'
            });
        }


        const curso = await this.repository.buscarPorId(cursoId);
        const cursoEnriquecido = await this.repository.enriquecerCurso(curso);


        const {
            totalAulas,
            totalQuestionarios,
            totalAlternativas,
            totalCertificados
        } = cursoEnriquecido.estatisticas;

        return {
            aulas: totalAulas,
            questionarios: totalQuestionarios,
            alternativas: totalAlternativas,
            certificados: totalCertificados
        };
    }


    formatarCargaHoraria(minutos) {
        if (!minutos) return '0h';

        const horas = Math.floor(minutos / 60);
        const minutosRestantes = minutos % 60;

        if (horas > 0) {
            return `${horas}h${minutosRestantes > 0 ? ` ${minutosRestantes}min` : ''}`;
        } else {
            return `${minutosRestantes}min`;
        }
    }
}

export default CursoService;