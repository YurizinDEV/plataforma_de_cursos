import CertificadoService from "../services/CertificadoService.js";
import {
  CommonResponse,
  HttpStatusCodes,
  messages
} from "../utils/helpers/index.js";

import { CertificadoQuerySchema, CertificadoIdSchema } from "../utils/validators/schemas/zod/querys/CertificadoQuerySchema.js";
import { CertificadoSchema } from "../utils/validators/schemas/zod/CertificadoSchema.js";

class CertificadoController {
  constructor() {
    this.service = new CertificadoService();
  }

  async criar(req, res) {
    const validatedData = CertificadoSchema.parse(req.body);
    const data = await this.service.criar(validatedData);
    return CommonResponse.created(res, data);
  }

  async buscar(req, res) {
    const { id } = req.params;
    CertificadoIdSchema.parse(id);

    const data = await this.service.buscarPorId(id);
    return CommonResponse.success(res, data);
  }

  async listar(req, res) {
    const query = req.query || {};
    if (Object.keys(query).length !== 0) {
      await CertificadoQuerySchema.parseAsync(query);
    }

    const data = await this.service.listar(query);
    return CommonResponse.success(res, data);
  }

  async listarPaginado(req, res) {
    const query = req.query || {};
    if (Object.keys(query).length !== 0) {
      await CertificadoQuerySchema.parseAsync(query);
    }

    const data = await this.service.listarPaginado({ query });
    return CommonResponse.success(res, data);
  }

  async emitirParaUsuario(req, res) {
    const { usuarioId, cursoId } = req.params;
    CertificadoIdSchema.parse(usuarioId);
    CertificadoIdSchema.parse(cursoId);

    const data = await this.service.emitirParaUsuario(usuarioId, cursoId);
    return CommonResponse.created(res, data, "Certificado emitido com sucesso");
  }
}

export default CertificadoController;