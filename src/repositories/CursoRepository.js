import CursoModel from '../models/Curso.js';
import CursoFilterBuilder from './filters/CursoFilterBuilder.js';
import {
    CustomError,
    HttpStatusCodes,
    messages
} from '../utils/helpers/index.js';

class CursoRepository {
    constructor() {
        this.model = CursoModel;
    }

    async listar(req) {
        const id = req.params.id || null;

        if (id) {
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

            const dadosEnriquecidos = this.enriquecerCurso(curso);
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
            limit: limite
        });

        resultado.docs = resultado.docs.map(curso => {
            return this.enriquecerCurso(curso);
        });

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
    enriquecerCurso(curso) {
        const cursoObj = curso.toObject();

        const totalProfessores = cursoObj.professores ? cursoObj.professores.length : 0;
        const totalTags = cursoObj.tags ? cursoObj.tags.length : 0;
        const totalMaterialComplementar = cursoObj.materialComplementar ? cursoObj.materialComplementar.length : 0;

        return {
            ...cursoObj,
            estatisticas: {
                totalProfessores,
                totalTags,
                totalMaterialComplementar
            }
        };
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
    async buscarPorTitulo(titulo) {
        const curso = await this.model.findOne({
            titulo
        });
        return curso;
    }
}

export default CursoRepository;