//UsuarioRepository.js

import UsuarioModel from '../models/Usuario.js';
import UsuarioFilterBuilder from './filters/UsuarioFilterBuilder.js';
import {
    CustomError,
    HttpStatusCodes,
    messages
} from '../utils/helpers/index.js';

class UsuarioRepository {
    constructor({
        usuarioModel = UsuarioModel
    } = {}) {
        this.model = usuarioModel;
    }
    async buscarPorEmail(email, idIgnorado = null, throwErrorIfNotFound = false) {
        const filtro = {
            email
        };
        if (idIgnorado) {
            filtro._id = {
                $ne: idIgnorado
            };
        }
        const usuario = await this.model.findOne(filtro, '+senha');
        if (throwErrorIfNotFound && !usuario) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: `Usuário com email ${email} não encontrado.`,
            });
        }
        return usuario;
    }

    async buscarPorId(id) {
        let usuario = await this.model.findById(id)
            .populate('cursosIds', 'titulo cargaHorariaTotal status')
            .populate('progresso.curso', 'titulo cargaHorariaTotal');

        if (!usuario) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário'),
            });
        }
        return usuario;
    }

    async listar(req) {
        const id = req.params.id || null;

        if (id) {
            const usuario = await this.model.findById(id)
                .populate('cursosIds', 'titulo cargaHorariaTotal status')
                .populate('progresso.curso', 'titulo cargaHorariaTotal');
            if (!usuario) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.NOT_FOUND.code,
                    errorType: 'resourceNotFound',
                    field: 'Usuário',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Usuário'),
                });
            }

            const dadosEnriquecidos = this.enriquecerUsuario(usuario);
            return dadosEnriquecidos;
        }
        
        const {
            nome,
            email,
            ativo,
            ehAdmin,
            dataInicio,
            dataFim,
            ordenarPor,
            direcao = 'asc',
            page = 1
        } = req.query;
        
        const limite = Math.min(parseInt(req.query.limite, 10) || 20, 100);
        
        const filterBuilder = new UsuarioFilterBuilder()
            .comNome(nome || '')
            .comEmail(email || '')
            .comAtivo(ativo)
            .comEhAdmin(ehAdmin)
            .comDataInicio(dataInicio)
            .comDataFim(dataFim)
            .ordenarPor(ordenarPor, direcao);

        if (typeof filterBuilder.build !== 'function') {
            throw new CustomError({
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                errorType: 'internalServerError',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.internalServerError('Usuário')
            });
        }

        const filtrosCompletos = filterBuilder.build();
        let opcoesPaginacao = {
            page,
            limit: limite,
        };

        // Se há filtros especiais (como ordenação), aplicá-los
        if (filtrosCompletos.especiais && filtrosCompletos.especiais.sort) {
            opcoesPaginacao.sort = filtrosCompletos.especiais.sort;
        }

        // Usar apenas os filtros normais para a consulta
        const filtrosConsulta = filtrosCompletos.filtros || filtrosCompletos;

        const resultado = await this.model.paginate(filtrosConsulta, {
            ...opcoesPaginacao,
            populate: [
                { path: 'cursosIds', select: 'titulo cargaHorariaTotal status' },
                { path: 'progresso.curso', select: 'titulo cargaHorariaTotal' }
            ]
        });

        resultado.docs = resultado.docs.map(usuario => {
            return this.enriquecerUsuario(usuario);
        });

        return resultado;
    }

    async criar(dadosUsuario) {
        const usuario = new this.model(dadosUsuario);
        return await usuario.save();
    }

    async atualizar(id, parsedData) {
        // Impede alteração direta de email e senha
        if ('email' in parsedData) delete parsedData.email;
        if ('senha' in parsedData) delete parsedData.senha;
        const usuario = await this.model.findByIdAndUpdate(id, parsedData, {
            new: true
        })
        .populate('cursosIds', 'titulo cargaHorariaTotal status')
        .populate('progresso.curso', 'titulo cargaHorariaTotal');
        
        if (!usuario) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário'),
            });
        }
        return usuario;
    }

    async deletar(id) {
        // Soft delete - muda ativo para false
        const usuario = await this.model.findByIdAndUpdate(
            id,
            { ativo: false },
            { new: true }
        )
        .populate('cursosIds', 'titulo cargaHorariaTotal status')
        .populate('progresso.curso', 'titulo cargaHorariaTotal');
        
        if (!usuario) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário'),
            });
        }
        return usuario;
    }

    async deletarFisicamente(id, options = {}) {
        const usuario = await this.model.findByIdAndDelete(id, options);
        if (!usuario) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário'),
            });
        }
        return usuario;
    }

    async restaurar(id) {
        const usuario = await this.model.findByIdAndUpdate(
            id,
            { ativo: true },
            { new: true }
        )
        .populate('cursosIds', 'titulo cargaHorariaTotal status')
        .populate('progresso.curso', 'titulo cargaHorariaTotal');
        
        if (!usuario) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário'),
            });
        }
        return usuario;
    }

    async buscarUsuariosComProgressoSignificativo(cursoId, limiteProgresso = 30) {
        return await this.model.find({
            'progresso': {
                $elemMatch: {
                    'curso': cursoId,
                    'percentual_conclusao': {
                        $gte: limiteProgresso.toString()
                    }
                }
            }
        }).select('_id nome email');
    }

    async removerReferenciaCurso(cursoId, options = {}) {
        const operacoes = [
            this.model.updateMany({
                    cursosIds: cursoId
                }, {
                    $pull: {
                        cursosIds: cursoId
                    }
                },
                options
            ),

            this.model.updateMany({
                    'progresso.curso': cursoId
                }, {
                    $pull: {
                        progresso: {
                            curso: cursoId
                        }
                    }
                },
                options
            )
        ];

        const resultados = await Promise.all(operacoes);

        return {
            cursosRemovidos: resultados[0].modifiedCount,
            progressosRemovidos: resultados[1].modifiedCount
        };
    }


    enriquecerUsuario(usuario) {
        const usuarioObj = usuario.toObject();
        const totalCursos = usuarioObj.cursosIds.length;
        
        // Estatísticas de progresso
        const progresso = usuarioObj.progresso || [];
        
        const cursosIniciados = progresso.filter(p => {
            const percentual = parseFloat(p.percentual_conclusao);
            return percentual > 0;
        }).length;
        
        const cursosConcluidos = progresso.filter(p => {
            const percentual = parseFloat(p.percentual_conclusao);
            return percentual >= 100;
        }).length;
        
        const cursosEmAndamento = progresso.filter(p => {
            const percentual = parseFloat(p.percentual_conclusao);
            return percentual > 0 && percentual < 100;
        }).length;

        return {
            ...usuarioObj,
            totalCursos,
            estatisticasProgresso: {
                cursosIniciados,
                cursosConcluidos,
                cursosEmAndamento,
                totalComProgresso: progresso.length,
                cursosInscritosSemProgresso: totalCursos - progresso.length
            }
        };
    }
}

export default UsuarioRepository;