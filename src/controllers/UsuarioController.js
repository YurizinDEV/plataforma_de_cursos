//UsuarioController.js
import UsuarioService from '../services/UsuarioService.js';
import {
    UsuarioQuerySchema,
    UsuarioIdSchema
} from '../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';
import {
    UsuarioSchema,
    UsuarioUpdateSchema
} from '../utils/validators/schemas/zod/UsuarioSchema.js';
import {
    CommonResponse,
    CustomError,
    HttpStatusCodes
} from '../utils/helpers/index.js';

class UsuarioController {
    constructor() {
        this.service = new UsuarioService();
    }

    async listar(req, res) {
        const {
            id
        } = req.params || {};
        if (id) {
            UsuarioIdSchema.parse(id);
        }

        const query = req.query || {};
        if (Object.keys(query).length !== 0) {
            await UsuarioQuerySchema.parseAsync(query);
        }

        const data = await this.service.listar(req);
        return CommonResponse.success(res, data);
    }

    async criar(req, res) {
        const parsedData = UsuarioSchema.parse(req.body);

        const data = await this.service.criar(parsedData);

        const usuarioLimpo = data.toObject();
        delete usuarioLimpo.senha;

        return CommonResponse.created(res, usuarioLimpo);
    }

    async atualizar(req, res) {
        const {
            id
        } = req.params;
        UsuarioIdSchema.parse(id);

        const parsedData = UsuarioUpdateSchema.parse(req.body);
        const data = await this.service.atualizar(id, parsedData);

        const usuarioLimpo = data.toObject();
        delete usuarioLimpo.senha;

        return CommonResponse.success(res, usuarioLimpo, 200,
            'Usuário atualizado com sucesso. Porém, o e-mail é ignorado em tentativas de atualização, pois é operação proibida.');
    }

    async deletar(req, res) {
        const {
            id
        } = req.params || {};
        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do usuário é obrigatório para deletar.'
            });
        }

        const data = await this.service.deletar(id);

        const usuarioLimpo = data.toObject();
        delete usuarioLimpo.senha;

        return CommonResponse.success(res, usuarioLimpo, 200, 'Usuário desativado com sucesso.');
    }

    async restaurar(req, res) {
        const {
            id
        } = req.params || {};
        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [{
                    path: 'id',
                    message: 'ID do usuário não fornecido.'
                }],
                customMessage: 'ID do usuário não fornecido.'
            });
        }
        UsuarioIdSchema.parse(id);
        const usuarioRestaurado = await this.service.restaurar(id);

        const usuarioLimpo = usuarioRestaurado.toObject();
        delete usuarioLimpo.senha;

        return CommonResponse.success(res, usuarioLimpo, 200, "Usuário restaurado com sucesso.");
    }

    async deletarFisicamente(req, res) {
        const {
            id
        } = req.params || {};
        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [{
                    path: 'id',
                    message: 'ID do usuário não fornecido.'
                }],
                customMessage: 'ID do usuário não fornecido.'
            });
        }
        UsuarioIdSchema.parse(id);
        const usuarioRemovido = await this.service.deletarFisicamente(id);
        return CommonResponse.success(res, usuarioRemovido, 200, "Usuário removido permanentemente.");
    }
}

export default UsuarioController;