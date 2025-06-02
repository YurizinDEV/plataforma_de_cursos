import AlternativaService from "../services/AlternativaService.js";
import {
  CommonResponse,
  CustomError,
  HttpStatusCodes,
  messages
} from "../utils/helpers/index.js";

import { AlternativaQuerySchema, AlternativaIdSchema } from "../utils/validators/schemas/zod/querys/AlternativaQuerySchema.js";
import { AlternativaSchema, AlternativaUpdateSchema } from "../utils/validators/schemas/zod/AlternativaSchema.js";

class AlternativaController {
  constructor() {
    this.service = new AlternativaService();
  }

  async criar(req, res) {
    const validatedData = AlternativaSchema.parse(req.body);
    const data = await this.service.criar(validatedData);
    return CommonResponse.created(res, data);
  }

  async buscar(req, res) {
    const { id } = req.params;
    AlternativaIdSchema.parse(id);

    const data = await this.service.buscarPorId(id);
    return CommonResponse.success(res, data);
  }

  async listar(req, res) {
    const query = req.query || {};
    if (Object.keys(query).length !== 0) {
      await AlternativaQuerySchema.parseAsync(query);
    }

    const data = await this.service.listar(query);
    return CommonResponse.success(res, data);
  }

  async atualizar(req, res) {
    const { id } = req.params;
    AlternativaIdSchema.parse(id);
    
    const validatedData = AlternativaUpdateSchema.parse(req.body);
    
    const data = await this.service.atualizar(id, validatedData);
    return CommonResponse.success(
        res, 
        data, 
        HttpStatusCodes.OK.code,
        messages.UPDATE_SUCCESS
    );
}

  async deletar(req, res) {
    const { id } = req.params;
    AlternativaIdSchema.parse(id);

    const data = await this.service.deletar(id);
    return CommonResponse.success(
        res,
        data,
        HttpStatusCodes.OK.code,
        messages.DELETE_SUCCESS
    );
}
}

export default AlternativaController;