import CursoService from '../services/CursoService.js';
import {
    CursoIdSchema,
    CursoQuerySchema
} from '../utils/validators/schemas/zod/querys/CursoQuerySchema.js';
import {
    CommonResponse
} from '../utils/helpers/index.js';

class CursoController {
    constructor() {
        this.service = new CursoService();
    }

    async listar(req, res) {
        const {
            id
        } = req.params || {};
        if (id) {
            CursoIdSchema.parse(id);
        }

        const query = req.query || {};
        if (Object.keys(query).length !== 0) {
            await CursoQuerySchema.parseAsync(query);
        }

        const data = await this.service.listar(req);
        return CommonResponse.success(res, data);
    }

}

export default CursoController;