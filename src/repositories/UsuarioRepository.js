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
        let query = await this.model.findById(id);
        const usuario = await query;

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
            const usuario = await this.model.findById(id);
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
            page = 1
        } = req.query;
        const limite = Math.min(parseInt(req.query.limite, 10) || 20, 100);
        const filterBuilder = new UsuarioFilterBuilder()
            .comNome(nome || '')
            .comEmail(email || '')
            .comAtivo(ativo);

        if (typeof filterBuilder.build !== 'function') {
            throw new CustomError({
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                errorType: 'internalServerError',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.internalServerError('Usuário')
            });
        }

        const resultado = await this.model.paginate(filterBuilder.build(), {
            page,
            limit: limite,
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
        const usuario = await this.model.findByIdAndUpdate(id, parsedData, {
            new: true
        });
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
        const usuario = await this.model.findByIdAndDelete(id);
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
    
    /**
     * Busca usuários com progresso significativo em um curso específico
     * Progresso significativo é definido como mais de 30% de conclusão
     */
    async buscarUsuariosComProgressoSignificativo(cursoId, limiteProgresso = 30) {
        return await this.model.find({
            'progresso': {
                $elemMatch: {
                    'curso': cursoId,
                    'percentual_conclusao': { $gte: limiteProgresso.toString() }
                }
            }
        }).select('_id nome email');
    }    /**
     * Remove referências a um curso do progresso e cursosIds de todos os usuários
     * @param {string} cursoId - ID do curso a ser removido das referências
     * @param {Object} options - Opções como sessão de transação
     * @returns {Promise<Object>} Objeto com contadores de referências removidas
     */
    async removerReferenciaCurso(cursoId, options = {}) {
        const operacoes = [
            // Remove o curso da lista de cursosIds
            this.model.updateMany(
                { cursosIds: cursoId }, 
                { $pull: { cursosIds: cursoId } },
                options
            ),
            
            // Remove o progresso relacionado ao curso
            this.model.updateMany(
                { 'progresso.curso': cursoId }, 
                { $pull: { progresso: { curso: cursoId } } },
                options
            )
        ];
        
        const resultados = await Promise.all(operacoes);
        
        return {
            cursosRemovidos: resultados[0].modifiedCount,
            progressosRemovidos: resultados[1].modifiedCount
        };
    }
    
    // Método auxiliar
    enriquecerUsuario(usuario) {
        const usuarioObj = usuario.toObject();
        const totalCursos = usuarioObj.cursosIds.length;
        const percentualMedio = usuarioObj.progresso.length > 0 ?
            usuarioObj.progresso.reduce((acc, prog) => acc + parseFloat(prog.percentual_conclusao), 0) / usuarioObj.progresso.length :
            0;

        return {
            ...usuarioObj,
            totalCursos,
            percentualMedio: percentualMedio.toFixed(2),
        };
    }

    // Método para simulação de erro do banco (apenas para testes)
    async simularErroBanco() {
        try {
            await this.model.findOne({
                _id: 'id-invalido-forcar-erro'
            });
            return true;
        } catch (error) {
            throw new CustomError({
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                errorType: 'databaseError',
                field: 'Database',
                details: [],
                customMessage: 'Erro inesperado do banco de dados.',
            });
        }
    }
}

export default UsuarioRepository;