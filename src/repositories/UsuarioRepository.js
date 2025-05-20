import UsuarioModel from '../models/Usuario.js';
import UsuarioFilterBuilder from './filters/UsuarioFilterBuilder.js';
import {
    CustomError,
    messages
} from '../utils/helpers/index.js';

class UsuarioRepository {
    constructor({
        usuarioModel = UsuarioModel
    } = {}) {
        this.model = usuarioModel;
    }

    async buscarPorEmail(email, idIgnorado = null) {
        const filtro = {
            email
        };
        if (idIgnorado) {
            filtro._id = {
                $ne: idIgnorado
            };
        }
        return await this.model.findOne(filtro, '+senha');
    }

    async buscarPorId(id) {
        let query = await this.model.findById(id);
        const usuario = await query;

        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
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

        // Se um ID for fornecido, retorna o usuário enriquecido com estatísticas
        if (id) {
            const usuario = await this.model.findById(id);
            if (!usuario) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Usuário',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Usuário'),
                });
            }

            const dadosEnriquecidos = this.enriquecerUsuario(usuario);
            return dadosEnriquecidos;
        }

        // Caso não haja ID, retorna todos os usuários com suporte a filtros e paginação
        const {
            nome,
            email,
            page = 1
        } = req.query;
        const limite = Math.min(parseInt(req.query.limite, 10) || 20, 100);
        const filterBuilder = new UsuarioFilterBuilder()
            .comNome(nome || '')
            .comEmail(email || '');

                    if (typeof filterBuilder.build !== 'function') {
            throw new CustomError({
                statusCode: 500,
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

        // Enriquecer cada usuário com estatísticas
        resultado.docs = resultado.docs.map(usuario => {
            return this.enriquecerUsuario(usuario);
        });

        return resultado;
    }

    // Método auxiliar para enriquecer os dados do usuário com estatísticas
    enriquecerUsuario(usuario) {
        const usuarioObj = usuario.toObject(); // Converter para objeto simples
        const totalCursos = usuarioObj.cursosIds.length; // Contar cursos
        const percentualMedio = usuarioObj.progresso.length > 0 ?
            usuarioObj.progresso.reduce((acc, prog) => acc + parseFloat(prog.percentual_conclusao), 0) / usuarioObj.progresso.length :
            0; // Calcular média percentual de conclusão

        return {
            ...usuarioObj,
            totalCursos,
            percentualMedio: percentualMedio.toFixed(2), // Limitar a duas casas decimais
        };
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
                statusCode: 404,
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
        return usuario;
    }
}

export default UsuarioRepository;