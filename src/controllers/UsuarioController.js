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
}

export default UsuarioController;