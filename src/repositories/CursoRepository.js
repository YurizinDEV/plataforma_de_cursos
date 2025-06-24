import CursoModel from '../models/Curso.js';
import CursoFilterBuilder from './filters/CursoFilterBuilder.js';
import AulaRepository from './AulaRepository.js';
import QuestionarioRepository from './QuestionarioRepository.js';
import CertificadoRepository from './CertificadoRepository.js';
import {
    CustomError,
    HttpStatusCodes,
    messages
} from '../utils/helpers/index.js';

class CursoRepository {
    constructor() {
        this.model = CursoModel;
        this.aulaRepository = new AulaRepository();
        this.questionarioRepository = new QuestionarioRepository();
        this.certificadoRepository = new CertificadoRepository();
    }

    async listar(req) {
        const id = req?.params?.id || null;

        if (id) {
            const curso = await this.model.findById(id);
            if (!curso) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.NOT_FOUND.code,
                    errorType: 'resourceNotFound',
                    field: 'Curso',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Curso')
                });            }

            const dadosEnriquecidos = await this.enriquecerCurso(curso);
            return dadosEnriquecidos;
        }

        const {
            titulo,
            tags,
            professores,
            cargaHorariaMin,
            cargaHorariaMax,
            criadoPorId,
            page = 1,
        } = req.query;

        const limite = Math.min(parseInt(req.query.limite, 10) || 20, 100);

        const filterBuilder = new CursoFilterBuilder()
            .comTitulo(titulo || '')
            .comTags(tags || '')
            .comProfessores(professores || '')
            .comCargaHoraria(cargaHorariaMin, cargaHorariaMax)
            .comCriadoPor(criadoPorId || '');

        if (typeof filterBuilder.build !== 'function') {
            throw new CustomError({
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                errorType: 'internalServerError',
                field: 'Curso',
                details: [],
                customMessage: messages.error.internalServerError('Curso')
            });
        }
        const filtro = filterBuilder.build();
        const resultado = await this.model.paginate(filtro, {
            page,
            limit: limite        });

        // Enriquecer cada curso com estatísticas adicionais de forma assíncrona
        const cursosEnriquecidos = await Promise.all(
            resultado.docs.map(curso => this.enriquecerCurso(curso))
        );
        
        resultado.docs = cursosEnriquecidos;

        return resultado;
    }

    async criar(dadosCurso) {
        const curso = new this.model(dadosCurso);
        return await curso.save();
    }

    async atualizar(id, dadosAtualizados) {
        const cursoAtualizado = await this.model.findByIdAndUpdate(
            id,
            dadosAtualizados, {
                new: true,
                runValidators: true
            }
        );

        if (!cursoAtualizado) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Curso',
                details: [],
                customMessage: messages.error.resourceNotFound('Curso')
            });
        }
        return cursoAtualizado;
    }

    async deletar(id) {
        const cursoRemovido = await this.model.findByIdAndDelete(id);

        if (!cursoRemovido) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Curso',
                details: [],
                customMessage: messages.error.resourceNotFound('Curso')
            });
        }
        return cursoRemovido;
    }
    // Método auxiliar para enriquecer os dados do curso com estatísticas
    async enriquecerCurso(curso) {
        const cursoObj = curso.toObject();
        const cursoId = cursoObj._id;

        // Estatísticas básicas
        const totalProfessores = cursoObj.professores ? cursoObj.professores.length : 0;
        const totalTags = cursoObj.tags ? cursoObj.tags.length : 0;
        const totalMaterialComplementar = cursoObj.materialComplementar ? cursoObj.materialComplementar.length : 0;
        
        // Estatísticas avançadas
        const totalAulas = await this.aulaRepository.contarPorCursoId(cursoId);
        const totalCertificados = await this.certificadoRepository.contarPorCursoId(cursoId);
        
        // Estatísticas de questionários e alternativas
        let totalQuestionarios = 0;
        let totalAlternativas = 0;
        
        if (totalAulas > 0) {
            // Buscar aulas para obter os IDs
            const aulas = await this.aulaRepository.buscarPorCursoId(cursoId);
            const aulaIds = aulas.map(a => a._id);
            
            if (aulaIds.length > 0) {
                // Buscar questionários dessas aulas
                const questionarios = await this.questionarioRepository.buscarPorAulaIds(aulaIds);
                totalQuestionarios = questionarios.length;
                
                // Contar alternativas se houver questionários
                if (totalQuestionarios > 0) {
                    const questionarioIds = questionarios.map(q => q._id);
                    totalAlternativas = await this.questionarioRepository.alternativaRepository.contarPorQuestionarioIds(questionarioIds);
                }
            }
        }
          // Usar o campo cargaHorariaTotal já existente no modelo
        const duracaoTotalMinutos = cursoObj.cargaHorariaTotal || 0;
        
        return {
            ...cursoObj,
            estatisticas: {
                totalProfessores,
                totalTags,
                totalMaterialComplementar,
                totalAulas,
                totalQuestionarios,
                totalAlternativas,
                totalCertificados,
                duracaoTotalMinutos,
                duracaoFormatada: this.formatarDuracao(duracaoTotalMinutos)
            }
        };
    }
    
    // Método auxiliar para formatar a duração em horas e minutos
    formatarDuracao(minutos) {
        if (!minutos) return '0min';
        
        const horas = Math.floor(minutos / 60);
        const minutosRestantes = minutos % 60;
        
        if (horas > 0) {
            return `${horas}h${minutosRestantes > 0 ? ` ${minutosRestantes}min` : ''}`;
        } else {
            return `${minutosRestantes}min`;
        }
    }

    async buscarPorId(id) {
        const curso = await this.model.findById(id);
        if (!curso) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Curso',
                details: [],
                customMessage: messages.error.resourceNotFound('Curso')
            });
        }
        return curso;
    }
    async buscarPorTitulo(titulo, options = {
        throwOnNotFound: true
    }) {
        const curso = await this.model.findOne({
            titulo
        });

        if (!curso && options.throwOnNotFound) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Curso',
                details: [],
                customMessage: messages.error.resourceNotFound('Curso com o título fornecido')
            });
        }

        return curso;
    }
}

export default CursoRepository;