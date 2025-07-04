import CursoModel from '../models/Curso.js';
import CursoFilterBuilder from './filters/CursoFilterBuilder.js';
import AulaRepository from './AulaRepository.js';
import QuestionarioRepository from './QuestionarioRepository.js';
import CertificadoRepository from './CertificadoRepository.js';
import AlternativaRepository from './AlternativaRepository.js';
import {
    CustomError,
    HttpStatusCodes,
    messages
} from '../utils/helpers/index.js';

class CursoRepository {
    constructor({
        model = CursoModel,
        aulaRepository = new AulaRepository(),
        questionarioRepository = new QuestionarioRepository(),
        certificadoRepository = new CertificadoRepository(),
        alternativaRepository = new AlternativaRepository()
    } = {}) {
        this.model = model;
        this.aulaRepository = aulaRepository;
        this.questionarioRepository = questionarioRepository;
        this.certificadoRepository = certificadoRepository;
        this.alternativaRepository = alternativaRepository;
    }

    async listar(req) {
        const query = req?.query || {};
        const params = req?.params || {};


        if (params.id) {
            const curso = await this.model.findById(params.id);
            if (!curso) {
                return {
                    docs: [],
                    totalDocs: 0,
                    limit: 20,
                    page: 1,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false,
                    pagingCounter: 1,
                    prevPage: null,
                    nextPage: null
                };
            }

            const cursoEnriquecido = await this.enriquecerCurso(curso);
            return {
                docs: [cursoEnriquecido],
                totalDocs: 1,
                limit: 20,
                page: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
                pagingCounter: 1,
                prevPage: null,
                nextPage: null
            };
        }

        const {
            tags,
            todasTags,
            professores,
            todosProfessores,
            titulo,
            tituloExato,
            descricao,
            buscaGeral,
            tag1,
            tag2,
            tag3,
            professor1,
            professor2,
            professor3,
            cargaHorariaMin,
            cargaHorariaMax,
            cargaHorariaFaixa,
            criadoPorId,
            criadoApos,
            criadoAntes,
            atualizadoApos,
            temMaterialComplementar,
            temThumbnail,
            status,
            quantidadeAulasMin,
            quantidadeAulasMax,
            ordenarPor,
            direcaoOrdem = 'asc',
            page = 1,
            limit = 20
        } = query;


        const tagsArrayParam = query['tags[]'];
        const professoresArrayParam = query['professores[]'];


        const tagsArray = tags ? (typeof tags === 'string' ? tags.split(',') : tags) : null;
        const todasTagsArray = todasTags ? (typeof todasTags === 'string' ? todasTags.split(',') : todasTags) : null;
        const professoresArray = professores ? (typeof professores === 'string' ? professores.split(',') : professores) : null;
        const todosProfessoresArray = todosProfessores ? (typeof todosProfessores === 'string' ? todosProfessores.split(',') : todosProfessores) : null;


        let finalTagsAnd = null;
        let finalProfessoresAnd = null;


        const tagsIndividuais = [tag1, tag2, tag3].filter(Boolean);
        if (tagsIndividuais.length > 0) {
            finalTagsAnd = tagsIndividuais;
        }


        const professoresIndividuais = [professor1, professor2, professor3].filter(Boolean);
        if (professoresIndividuais.length > 0) {
            finalProfessoresAnd = professoresIndividuais;
            console.log('Usando professoresIndividuais:', finalProfessoresAnd);
        }


        if (tagsArrayParam) {
            const tagsFromArray = Array.isArray(tagsArrayParam) ? tagsArrayParam : [tagsArrayParam];
            finalTagsAnd = tagsFromArray.filter(Boolean);
            console.log('Usando tagsArrayParam:', finalTagsAnd);
        }

        if (professoresArrayParam) {
            const professoresFromArray = Array.isArray(professoresArrayParam) ? professoresArrayParam : [professoresArrayParam];
            finalProfessoresAnd = professoresFromArray.filter(Boolean);
            console.log('Usando professoresArrayParam:', finalProfessoresAnd);
        }


        if (!finalTagsAnd && todasTagsArray) {
            finalTagsAnd = todasTagsArray;
            console.log('Usando todasTagsArray como fallback:', finalTagsAnd);
        }

        if (!finalProfessoresAnd && todosProfessoresArray) {
            finalProfessoresAnd = todosProfessoresArray;
            console.log('Usando todosProfessoresArray como fallback:', finalProfessoresAnd);
        }

        const limite = Math.min(parseInt(limit, 10) || 20, 100);

        const filterBuilder = new CursoFilterBuilder();


        if (titulo) filterBuilder.comTitulo(titulo);
        if (tituloExato) filterBuilder.comTituloExato(tituloExato);
        if (descricao) filterBuilder.comDescricao(descricao);
        if (buscaGeral) filterBuilder.comBuscaGeral(buscaGeral);


        if (finalTagsAnd && finalTagsAnd.length > 0) {

            filterBuilder.comTodasTags(finalTagsAnd);
        } else if (tagsArray) {

            filterBuilder.comTags(tagsArray);
        }


        if (finalProfessoresAnd && finalProfessoresAnd.length > 0) {

            filterBuilder.comTodosProfessores(finalProfessoresAnd);
        } else if (professoresArray) {

            filterBuilder.comProfessores(professoresArray);
        }


        if (cargaHorariaFaixa) {
            filterBuilder.comCargaHorariaFaixa(cargaHorariaFaixa);
        } else if (cargaHorariaMin || cargaHorariaMax) {
            filterBuilder.comCargaHoraria(cargaHorariaMin, cargaHorariaMax);
        }


        if (criadoApos) filterBuilder.criadoApos(criadoApos);
        if (criadoAntes) filterBuilder.criadoAntes(criadoAntes);
        if (atualizadoApos) filterBuilder.atualizadoApos(atualizadoApos);



        let temMaterialBoolean;
        if (temMaterialComplementar !== undefined) {
            if (typeof temMaterialComplementar === 'string') {
                temMaterialBoolean = temMaterialComplementar === 'true' || temMaterialComplementar === '1';
            } else {
                temMaterialBoolean = Boolean(temMaterialComplementar);
            }
            console.log(`DEBUG-TEM-MATERIAL: ${typeof temMaterialComplementar} => ${temMaterialComplementar} => convertido para ${temMaterialBoolean}`);
            filterBuilder.comMaterialComplementar(temMaterialBoolean);
        }
        if (temThumbnail !== undefined) filterBuilder.comThumbnail(temThumbnail);


        if (criadoPorId) filterBuilder.comCriadoPor(criadoPorId);


        if (status) {
            filterBuilder.comStatus(status);
        } else {

            filterBuilder.apenasAtivos();
        }
        if (quantidadeAulasMin || quantidadeAulasMax) filterBuilder.comQuantidadeAulas(quantidadeAulasMin, quantidadeAulasMax);
        if (ordenarPor) filterBuilder.ordenarPor(ordenarPor, direcaoOrdem);

        if (typeof filterBuilder.build !== 'function') {
            throw new CustomError({
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                errorType: 'internalServerError',
                field: 'Curso',
                details: [],
                customMessage: messages.error.internalServerError('Curso')
            });
        }

        const buildResult = filterBuilder.build(false, true);
        const filtros = buildResult.filtros || buildResult;
        const filtrosEspeciais = buildResult.especiais || {};


        const opcoesPaginacao = {
            page,
            limit: limite
        };


        if (filtrosEspeciais.sort) {
            opcoesPaginacao.sort = filtrosEspeciais.sort;
        }


        if (filtrosEspeciais.quantidadeAulas) {
            return await this.listarComQuantidadeAulas(filtros, filtrosEspeciais.quantidadeAulas, opcoesPaginacao);
        }

        const resultado = await this.model.paginate(filtros, opcoesPaginacao);


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

        const cursoAtualizado = await this.model.findByIdAndUpdate(
            id, {
                status: 'arquivado'
            }, {
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


    async deletarFisicamente(id) {
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


    async restaurar(id) {
        const cursoRestaurado = await this.model.findByIdAndUpdate(
            id, {
                status: 'ativo'
            }, {
                new: true,
                runValidators: true
            }
        );

        if (!cursoRestaurado) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Curso',
                details: [],
                customMessage: messages.error.resourceNotFound('Curso')
            });
        }
        return cursoRestaurado;
    }


    async listarComQuantidadeAulas(filtrosBase, filtroQuantidadeAulas, opcoesPaginacao) {
        const pipeline = [{
                $match: filtrosBase
            },
            {
                $lookup: {
                    from: 'aulas',
                    localField: '_id',
                    foreignField: 'cursoId',
                    as: 'aulas'
                }
            },
            {
                $addFields: {
                    quantidadeAulas: {
                        $size: '$aulas'
                    }
                }
            }
        ];


        if (filtroQuantidadeAulas && (filtroQuantidadeAulas.min !== undefined || filtroQuantidadeAulas.max !== undefined)) {
            const matchQuantidade = {};
            if (filtroQuantidadeAulas.min !== undefined) matchQuantidade.$gte = filtroQuantidadeAulas.min;
            if (filtroQuantidadeAulas.max !== undefined) matchQuantidade.$lte = filtroQuantidadeAulas.max;
            pipeline.push({
                $match: {
                    quantidadeAulas: matchQuantidade
                }
            });
        }

        pipeline.push({
            $unset: 'aulas'
        });

        if (opcoesPaginacao.sort) {
            pipeline.push({
                $sort: opcoesPaginacao.sort
            });
        }

        const skip = (opcoesPaginacao.page - 1) * opcoesPaginacao.limit;
        const countPipeline = [...pipeline, {
            $count: 'total'
        }];
        const totalResult = await this.model.aggregate(countPipeline);
        const total = totalResult[0]?.total || 0;

        pipeline.push({
            $skip: skip
        }, {
            $limit: opcoesPaginacao.limit
        });
        const docs = await this.model.aggregate(pipeline);

        const cursosEnriquecidos = docs.length > 0 ? await Promise.all(
            docs.map(curso => this.enriquecerCurso({
                toObject: () => curso
            }))
        ) : [];

        const totalPages = Math.ceil(total / opcoesPaginacao.limit) || 1;

        const hasNextPage = skip + docs.length < total;
        const hasPrevPage = opcoesPaginacao.page > 1;
        const nextPage = hasNextPage ? opcoesPaginacao.page + 1 : null;
        const prevPage = hasPrevPage ? opcoesPaginacao.page - 1 : null;

        return {
            docs: cursosEnriquecidos,
            totalDocs: total,
            limit: opcoesPaginacao.limit,
            page: opcoesPaginacao.page,
            totalPages,
            hasNextPage,
            hasPrevPage,
            nextPage,
            prevPage
        };
    }

    async enriquecerCurso(curso) {
        const cursoObj = curso.toObject();
        const cursoId = cursoObj._id;
        const totalProfessores = cursoObj.professores ? cursoObj.professores.length : 0;
        const totalTags = cursoObj.tags ? cursoObj.tags.length : 0;
        const totalMaterialComplementar = cursoObj.materialComplementar ? cursoObj.materialComplementar.length : 0;
        const totalAulas = await this.aulaRepository.contarPorCursoId(cursoId);
        const totalCertificados = await this.certificadoRepository.contarPorCursoId(cursoId);
        
        let totalQuestionarios = 0;
        let totalAlternativas = 0;
        
        if (totalAulas > 0) {
            const aulas = await this.aulaRepository.buscarPorCursoId(cursoId);
            const aulaIds = aulas.map(a => a._id);
            if (aulaIds.length > 0) {
                const questionarios = await this.questionarioRepository.buscarPorAulaIds(aulaIds);
                totalQuestionarios = questionarios.length;
                if (totalQuestionarios > 0) {
                    const questionarioIds = questionarios.map(q => q._id);
                    totalAlternativas = await this.alternativaRepository.contarPorQuestionarioIds(questionarioIds);
                }
            }
        }
        
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

    async buscarPorCriador(usuarioId) {
        return await this.model.find({ criadoPorId: usuarioId });
    }

    async removerReferenciaUsuario(usuarioId, options = {}) {
        // Remover referências do usuário criador em cursos (definir como null ou remover)
        const resultado = await this.model.updateMany(
            { criadoPorId: usuarioId },
            { $unset: { criadoPorId: 1 } },
            options
        );
        
        return resultado.modifiedCount;
    }
}

export default CursoRepository;