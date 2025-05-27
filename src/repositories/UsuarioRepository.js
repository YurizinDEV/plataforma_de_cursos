//UsuarioRepository.js

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
            page = 1
        } = req.query;
        const limite = Math.min(parseInt(req.query.limite, 10) || 20, 100);
        const filterBuilder = new UsuarioFilterBuilder()
            .comNome(nome || '')
            .comEmail(email || '');

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
        return usuario;
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
}

export default UsuarioRepository;