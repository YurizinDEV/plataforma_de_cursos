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
        } = req.query;

        // Extrair arrays de tags e professores (suporte a ?tags[]=js&tags[]=db)
        const tagsArrayParam = req.query['tags[]'];
        const professoresArrayParam = req.query['professores[]'];

        // Transformar strings separadas por vírgula em arrays (seguindo padrão do schema)
        const tagsArray = tags ? (typeof tags === 'string' ? tags.split(',') : tags) : null;
        const todasTagsArray = todasTags ? (typeof todasTags === 'string' ? todasTags.split(',') : todasTags) : null;
        const professoresArray = professores ? (typeof professores === 'string' ? professores.split(',') : professores) : null;
        const todosProfessoresArray = todosProfessores ? (typeof todosProfessores === 'string' ? todosProfessores.split(',') : todosProfessores) : null;

        // NOVA LÓGICA: Construir arrays AND a partir de múltiplas abordagens
        let finalTagsAnd = null;
        let finalProfessoresAnd = null;

        // Abordagem 1: tag1, tag2, tag3
        const tagsIndividuais = [tag1, tag2, tag3].filter(Boolean);
        if (tagsIndividuais.length > 0) {
            finalTagsAnd = tagsIndividuais;
        }

        // Abordagem 2: professor1, professor2, professor3  
        const professoresIndividuais = [professor1, professor2, professor3].filter(Boolean);
        if (professoresIndividuais.length > 0) {
            finalProfessoresAnd = professoresIndividuais;
            console.log('✅ Usando professoresIndividuais:', finalProfessoresAnd);
        }

        // Abordagem 3: arrays via ?tags[]=js&tags[]=db
        if (tagsArrayParam) {
            const tagsFromArray = Array.isArray(tagsArrayParam) ? tagsArrayParam : [tagsArrayParam];
            finalTagsAnd = tagsFromArray.filter(Boolean);
            console.log('✅ Usando tagsArrayParam:', finalTagsAnd);
        }

        if (professoresArrayParam) {
            const professoresFromArray = Array.isArray(professoresArrayParam) ? professoresArrayParam : [professoresArrayParam];
            finalProfessoresAnd = professoresFromArray.filter(Boolean);
            console.log('✅ Usando professoresArrayParam:', finalProfessoresAnd);
        }

        // Abordagem 4: todasTags e todosProfessores (fallback para a implementação original)
        if (!finalTagsAnd && todasTagsArray) {
            finalTagsAnd = todasTagsArray;
            console.log('✅ Usando todasTagsArray como fallback:', finalTagsAnd);
        }

        if (!finalProfessoresAnd && todosProfessoresArray) {
            finalProfessoresAnd = todosProfessoresArray;
            console.log('✅ Usando todosProfessoresArray como fallback:', finalProfessoresAnd);
        }

        const limite = Math.min(parseInt(limit, 10) || 20, 100);

        const filterBuilder = new CursoFilterBuilder();

        // Aplicar filtros básicos
        if (titulo) filterBuilder.comTitulo(titulo);
        if (tituloExato) filterBuilder.comTituloExato(tituloExato);
        if (descricao) filterBuilder.comDescricao(descricao);
        if (buscaGeral) filterBuilder.comBuscaGeral(buscaGeral);

        // NOVA LÓGICA: Filtros de tags com prioridade para AND
        if (finalTagsAnd && finalTagsAnd.length > 0) {
            // Usar filtro AND quando há múltiplas tags especificadas via parâmetros individuais ou arrays
            filterBuilder.comTodasTags(finalTagsAnd);
        } else if (tagsArray) {
            // Usar filtro OR quando há tags via parâmetro único
            filterBuilder.comTags(tagsArray);
        }

        // NOVA LÓGICA: Filtros de professores com prioridade para AND
        if (finalProfessoresAnd && finalProfessoresAnd.length > 0) {
            // Usar filtro AND quando há múltiplos professores especificados via parâmetros individuais ou arrays
            filterBuilder.comTodosProfessores(finalProfessoresAnd);
        } else if (professoresArray) {
            // Usar filtro OR quando há professores via parâmetro único
            filterBuilder.comProfessores(professoresArray);
        }

        // Filtros de carga horária
        if (cargaHorariaFaixa) {
            filterBuilder.comCargaHorariaFaixa(cargaHorariaFaixa);
        } else if (cargaHorariaMin || cargaHorariaMax) {
            filterBuilder.comCargaHoraria(cargaHorariaMin, cargaHorariaMax);
        }

        // Filtros de data
        if (criadoApos) filterBuilder.criadoApos(criadoApos);
        if (criadoAntes) filterBuilder.criadoAntes(criadoAntes);
        if (atualizadoApos) filterBuilder.atualizadoApos(atualizadoApos);

        // Filtros de conteúdo
        // Conversão explícita para boolean para evitar problemas de tipo
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

        // Filtro de criador
        if (criadoPorId) filterBuilder.comCriadoPor(criadoPorId);

        // Novos filtros
        if (status) filterBuilder.comStatus(status);
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
        
        const buildResult = filterBuilder.build(false, true); // Forçar nova estrutura
        const filtros = buildResult.filtros || buildResult; // Compatibilidade com versão antiga
        const filtrosEspeciais = buildResult.especiais || {};
        
        // Configurar opções de paginação
        const opcoesPaginacao = {
            page,
            limit: limite
        };
        
        // Adicionar ordenação se especificada
        if (filtrosEspeciais.sort) {
            opcoesPaginacao.sort = filtrosEspeciais.sort;
        }
        
        // Se há filtro de quantidade de aulas, usar aggregation
        if (filtrosEspeciais.quantidadeAulas) {
            return await this.listarComQuantidadeAulas(filtros, filtrosEspeciais.quantidadeAulas, opcoesPaginacao);
        }
        
        const resultado = await this.model.paginate(filtros, opcoesPaginacao);

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
        // Soft delete: alterar status para 'arquivado' ao invés de remover fisicamente
        const cursoAtualizado = await this.model.findByIdAndUpdate(
            id,
            { status: 'arquivado' },
            { new: true, runValidators: true }
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

    // Método para exclusão física (apenas para administradores)
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

    // Método para restaurar curso arquivado
    async restaurar(id) {
        const cursoRestaurado = await this.model.findByIdAndUpdate(
            id,
            { status: 'ativo' },
            { new: true, runValidators: true }
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

    // Método auxiliar para listar cursos com filtro de quantidade de aulas
    async listarComQuantidadeAulas(filtrosBase, filtroQuantidadeAulas, opcoesPaginacao) {
        const pipeline = [
            // Match com filtros básicos
            { $match: filtrosBase },
            
            // Lookup para contar aulas
            {
                $lookup: {
                    from: 'aulas', // nome da collection de aulas
                    localField: '_id',
                    foreignField: 'cursoId',
                    as: 'aulas'
                }
            },
            
            // Adicionar campo com contagem de aulas
            {
                $addFields: {
                    quantidadeAulas: { $size: '$aulas' }
                }
            },
            
            // Filtrar por quantidade de aulas
            {
                $match: {
                    quantidadeAulas: {
                        ...(filtroQuantidadeAulas.min && { $gte: filtroQuantidadeAulas.min }),
                        ...(filtroQuantidadeAulas.max && { $lte: filtroQuantidadeAulas.max })
                    }
                }
            },
            
            // Remover o campo aulas para economizar espaço
            {
                $unset: 'aulas'
            }
        ];
        
        // Adicionar ordenação se especificada
        if (opcoesPaginacao.sort) {
            pipeline.push({ $sort: opcoesPaginacao.sort });
        }
        
        // Executar aggregation com paginação manual
        const skip = (opcoesPaginacao.page - 1) * opcoesPaginacao.limit;
        
        // Contar total de documentos
        const countPipeline = [...pipeline, { $count: 'total' }];
        const totalResult = await this.model.aggregate(countPipeline);
        const total = totalResult[0]?.total || 0;
        
        // Aplicar paginação
        pipeline.push(
            { $skip: skip },
            { $limit: opcoesPaginacao.limit }
        );
        
        const docs = await this.model.aggregate(pipeline);
        
        // Enriquecer cada curso
        const cursosEnriquecidos = await Promise.all(
            docs.map(curso => this.enriquecerCurso({ toObject: () => curso }))
        );
        
        // Retornar no formato esperado pelo mongoose-paginate
        return {
            docs: cursosEnriquecidos,
            totalDocs: total,
            limit: opcoesPaginacao.limit,
            page: opcoesPaginacao.page,
            totalPages: Math.ceil(total / opcoesPaginacao.limit),
            hasNextPage: opcoesPaginacao.page < Math.ceil(total / opcoesPaginacao.limit),
            hasPrevPage: opcoesPaginacao.page > 1,
            nextPage: opcoesPaginacao.page < Math.ceil(total / opcoesPaginacao.limit) ? opcoesPaginacao.page + 1 : null,
            prevPage: opcoesPaginacao.page > 1 ? opcoesPaginacao.page - 1 : null
        };
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