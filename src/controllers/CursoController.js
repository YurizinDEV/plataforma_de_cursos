import CursoService from '../services/CursoService.js';
import {
    CursoIdSchema,
    CursoQuerySchema
} from '../utils/validators/schemas/zod/querys/CursoQuerySchema.js';
import {
    CursoSchema,
    CursoUpdateSchema
} from '../utils/validators/schemas/zod/CursoSchema.js';
import {
    CommonResponse,
    CustomError,
    HttpStatusCodes
} from '../utils/helpers/index.js';

class CursoController {
    constructor() {
        this.service = new CursoService();
    }

    async listar(req, res) {
        const { id } = req.params || {};
        
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

    async criar(req, res) {
        const parsedData = CursoSchema.parse(req.body);
        const curso = await this.service.criar(parsedData);
        return CommonResponse.created(res, curso, "Curso criado com sucesso.");
    }

    async atualizar(req, res) {
        const { id } = req.params;
        CursoIdSchema.parse(id);
        
        const parsedData = CursoUpdateSchema.parse(req.body);
        if (Object.keys(parsedData).length === 0) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'body',
                details: [{
                    path: 'body',
                    message: 'Nenhum dado fornecido para atualização.'
                }],
                customMessage: 'Nenhum dado fornecido para atualização.'
            });
        }
        
        const cursoAtualizado = await this.service.atualizar(id, parsedData);
        return CommonResponse.success(res, cursoAtualizado, 200, "Curso atualizado com sucesso.");
    }

    async deletar(req, res) {
        const { id } = req.params || {};
        
        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [{
                    path: 'id',
                    message: 'ID do curso não fornecido.'
                }],
                customMessage: 'ID do curso não fornecido.'
            });
        }
        
        CursoIdSchema.parse(id);
        const cursoRemovido = await this.service.deletar(id);
        return CommonResponse.success(res, cursoRemovido, 200, "Curso removido com sucesso.");
    }
}

export default CursoController;
