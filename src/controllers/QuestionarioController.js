import QuestionarioService from "../services/QuestionarioService.js";
import {
  CommonResponse,
  HttpStatusCodes,
  messages
} from "../utils/helpers/index.js";

import { QuestionarioQuerySchema, QuestionarioIdSchema } from "../utils/validators/schemas/zod/querys/QuestionarioQuerySchema.js";
import { QuestionarioSchema, QuestionarioUpdateSchema } from "../utils/validators/schemas/zod/QuestionarioSchema.js";

class QuestionarioController {
  constructor() {
    this.service = new QuestionarioService();
  }

  async criar(req, res) {
    const validatedData = QuestionarioSchema.parse(req.body);
    const data = await this.service.criar(validatedData);
    return CommonResponse.created(res, data);
  }

  async buscar(req, res) {
    const { id } = req.params;
    QuestionarioIdSchema.parse(id);

    const data = await this.service.buscarPorId(id);
    return CommonResponse.success(res, data);
  }

  async listar(req, res) {
    const query = req.query || {};
    if (Object.keys(query).length !== 0) {
      await QuestionarioQuerySchema.parseAsync(query);
    }

    const data = await this.service.listar(query);
    return CommonResponse.success(res, data);
  }

  async listarPaginado(req, res) {
    const query = req.query || {};
    if (Object.keys(query).length !== 0) {
      await QuestionarioQuerySchema.parseAsync(query);
    }

    const data = await this.service.listarPaginado({ query });
    return CommonResponse.success(res, data);
  }

  async atualizar(req, res) {
    const { id } = req.params;
    QuestionarioIdSchema.parse(id);
    
    const validatedData = QuestionarioUpdateSchema.parse(req.body);
    
    const data = await this.service.atualizar(id, validatedData);
    return CommonResponse.success(res, data, HttpStatusCodes.OK, messages.UPDATE_SUCCESS);
  }

  async deletar(req, res) {
    const { id } = req.params;
    QuestionarioIdSchema.parse(id);

    const data = await this.service.deletar(id);
    return CommonResponse.success(res, data, HttpStatusCodes.OK, messages.DELETE_SUCCESS);
  }

  async adicionarAlternativa(req, res) {
    const { questionarioId, alternativaId } = req.params;
    QuestionarioIdSchema.parse(questionarioId);
    QuestionarioIdSchema.parse(alternativaId);

    const data = await this.service.adicionarAlternativa(questionarioId, alternativaId);
    return CommonResponse.success(res, data, HttpStatusCodes.OK, "Alternativa adicionada com sucesso");
  }
}

export default QuestionarioController;