import CursoService from '../services/CursoServices.js';
import { CursoSchema, CursoUpdateSchema } from '../utils/validators/schemas/zod/CursoSchema.js';
import { CommonResponse } from '../utils/helpers/index.js';

class CursoController {
    constructor() {
        this.service = new CursoService();
    }

    async listar(req, res) {
        const cursos = await this.service.listar(req);
        return CommonResponse.success(res, cursos);
    }

    async criar(req, res) {
        const parsedData = CursoSchema.parse(req.body);
        const curso = await this.service.criar(parsedData);
        return CommonResponse.created(res, curso);
    }

    async atualizar(req, res) {
        const { id } = req.params;
        const parsedData = CursoUpdateSchema.parse(req.body);
        const cursoAtualizado = await this.service.atualizar(id, parsedData);
        return CommonResponse.success(res, cursoAtualizado);
    }

    async deletar(req, res) {
        const { id } = req.params;
        await this.service.deletar(id);
        return CommonResponse.success(res, null, 204);
    }
}

export default CursoController;