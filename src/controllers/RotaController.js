import RotaService from '../services/RotaService.js';
import {
    CommonResponse,
    CustomError,
    HttpStatusCodes
} from '../utils/helpers/index.js';

class RotaController {
    constructor() {
        this.service = new RotaService();
    }

    async listar(req, res) {
        const data = await this.service.listar(req);
        return CommonResponse.success(res, data);
    }

    async criar(req, res) {
        const data = await this.service.criar(req.body);
        return CommonResponse.created(res, data);
    }

    async atualizar(req, res) {
        const data = await this.service.atualizar(req.params.id, req.body);
        return CommonResponse.success(res, data);
    }

    async deletar(req, res) {
        const data = await this.service.deletar(req.params.id);
        return CommonResponse.success(res, data);
    }
}

export default RotaController;
