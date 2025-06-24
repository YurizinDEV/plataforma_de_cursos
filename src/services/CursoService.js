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
        // Verifica se o usuário criador existe
        await this.validateUsuarioCriador(dadosCurso.criadoPorId);
        
        // Valida se o título já existe
        await this.validateTitulo(dadosCurso.titulo);
        
        return await this.repository.criar(dadosCurso);
    }

    async atualizar(id, dadosAtualizados) {
        await this.ensureCursoExists(id);

        // Se estiver atualizando o criador, verifica se o novo usuário existe
        if (dadosAtualizados.criadoPorId) {
            await this.validateUsuarioCriador(dadosAtualizados.criadoPorId);
        }

        if (dadosAtualizados.titulo) {
            await this.validateTitulo(dadosAtualizados.titulo, id);
        }
        return await this.repository.atualizar(id, dadosAtualizados);
    }    async deletar(id) {
        // Verifica se o curso existe
        const curso = await this.ensureCursoExists(id);
        
        // Verifica dependências críticas antes da exclusão
        const estatisticas = await this.verificarDependenciasParaExclusao(id);
        
        // Iniciar uma sessão de transação para garantir atomicidade
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            // 1. Obter todas as aulas do curso
            const aulas = await this.aulaRepository.buscarPorCursoId(id);
            const aulaIds = aulas.map(a => a._id);
            
            // 2. Se houver aulas, deletar questionários e alternativas relacionados
            let resultadoQuestionarios = { questionariosExcluidos: 0, alternativasExcluidas: 0 };
            
            if (aulaIds.length > 0) {
                resultadoQuestionarios = await this.questionarioRepository.deletarPorAulaIds(aulaIds, { session });
            }
            
            // 3. Deletar todas as aulas relacionadas ao curso
            const aulasExcluidas = await this.aulaRepository.deletarPorCursoId(id, { session });
            
            // 4. Deletar certificados relacionados ao curso
            const certificadosExcluidos = await this.certificadoRepository.deletarPorCursoId(id, { session });
            
            // 5. Remover referências do curso nos usuários (progresso e cursosIds)
            const refsRemovidas = await this.usuarioRepository.removerReferenciaCurso(id, { session });
            
            // 6. Finalmente deletar o curso
            await this.repository.deletar(id, { session });
            
            // Commit da transação se tudo ocorreu bem
            await session.commitTransaction();            return { 
                mensagem: 'Curso e todos os seus recursos relacionados foram excluídos com sucesso.',
                estatisticas: {                    curso: curso.titulo,
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
            // Reverter todas as alterações em caso de erro
            await session.abortTransaction();
            
            // Transformar em CustomError conforme padrão do projeto
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
            // Encerrar a sessão
            session.endSession();
        }
    }

    // Métodos auxiliares     
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
        }    }
    
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
      // Método auxiliar para validar a existência do usuário criador
    async validateUsuarioCriador(usuarioId) {
        try {
            return await this.usuarioRepository.buscarPorId(usuarioId);
        } catch (error) {
            // Transformamos o erro NOT_FOUND em um erro de validação BAD_REQUEST
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
    }    // Método para verificar se o curso tem usuários com progresso significativo
    async verificarDependenciasParaExclusao(cursoId) {
        // Verifica se existem usuários com progresso significativo neste curso
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
        
        // Obtém o curso com estatísticas enriquecidas
        const curso = await this.repository.buscarPorId(cursoId);
        const cursoEnriquecido = await this.repository.enriquecerCurso(curso);
        
        // Extrai estatísticas para informar ao usuário o que será excluído
        const { totalAulas, totalQuestionarios, totalAlternativas, totalCertificados } = cursoEnriquecido.estatisticas;
        
        return {
            aulas: totalAulas,
            questionarios: totalQuestionarios,
            alternativas: totalAlternativas,
            certificados: totalCertificados
        };
    }

    // Método auxiliar para formatar a carga horária
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