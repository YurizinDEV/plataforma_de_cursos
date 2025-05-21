//UsuarioController.js

import UsuarioService from '../services/UsuarioService.js';
import { UsuarioQuerySchema, UsuarioIdSchema } from '../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';
import { UsuarioSchema, UsuarioUpdateSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js';
import { CommonResponse, CustomError, HttpStatusCodes } from '../utils/helpers/index.js';

class UsuarioController {
    constructor() {
        this.service = new UsuarioService();
    }

    async listar(req, res) {
        const { id } = req.params || {};
        if (id) {
            // Validação do ID do usuário
            UsuarioIdSchema.parse(id);
        }

        const query = req.query || {};
        if (Object.keys(query).length !== 0) {
            // Validação de query params como nome e email
            await UsuarioQuerySchema.parseAsync(query);
        }

        const data = await this.service.listar(req);
        return CommonResponse.success(res, data);
    }

    async criar(req, res) {
        // Validação dos dados do novo usuário
        const parsedData = UsuarioSchema.parse(req.body);
        
        // Criação do usuário
        const data = await this.service.criar(parsedData);

        // Limpeza de dados sensíveis antes de retornar
        const usuarioLimpo = data.toObject();
        delete usuarioLimpo.senha;  // Remover a senha do usuário

        return CommonResponse.created(res, usuarioLimpo);
    }

    async atualizar(req, res) {
        const { id } = req.params;
        // Validação do ID do usuário
        UsuarioIdSchema.parse(id);

        // Validação dos dados de atualização
        const parsedData = UsuarioUpdateSchema.parse(req.body);
        const data = await this.service.atualizar(id, parsedData);

        // Limpeza de dados sensíveis antes de retornar
        const usuarioLimpo = data.toObject();
        delete usuarioLimpo.senha;  // Remover a senha do usuário

        return CommonResponse.success(res, usuarioLimpo, 200, 
            'Usuário atualizado com sucesso. Porém, o e-mail é ignorado em tentativas de atualização, pois é operação proibida.');
    }

    async deletar(req, res) {
        const { id } = req.params || {};
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
        return CommonResponse.success(res, data, 200, 'Usuário excluído com sucesso.');
    }
}

export default UsuarioController;