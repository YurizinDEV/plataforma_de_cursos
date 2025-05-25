import AulaService from '../services/AulaService.js';
import {
  CommonResponse,
  CustomError,
  HttpStatusCodes,
  errorHandler,
  messages,
  StatusService,
  asyncWrapper
} from '../utils/helpers/index.js';

import { AulaQuerySchema, AulaIdSchema } from '../utils/validators/schemas/zod/querys/AulaQuerySchema.js';
import { AulaSchema, AulaUpdateSchema } from '../utils/validators/schemas/zod/AulaSchema.js';

class AulaController {
  constructor() {
    this.service = new AulaService();
  }

  // GET /aulas ou /aulas/:id
  async listar(req, res) {
    console.log('Estou no listar em AulaController');

    // Validação do ID (se existir)
    const { id } = req.params || null;
    if (id) {
      AulaIdSchema.parse(id);
    }

    const query = req.query || {};
    if (Object.keys(query).length !== 0) {
      await AulaQuerySchema.parseAsync(query);
    }

    const data = await this.service.listar(req);
    return CommonResponse.success(res, data);
  }

  // POST /aulas
  async criar(req, res) {
    const validatedData = AulaSchema.parse(req.body);
    const data = await this.service.criar({ body: validatedData });
    return CommonResponse.created(res, data);
  }

  // GET /aulas/:id
  async acessar(req, res) {
    const { id } = req.params;
    AulaIdSchema.parse(id);

    const data = await this.service.listar({ params: { id } });
    return CommonResponse.success(res, data);
  }

  // PUT /aulas/:id
  async atualizar(req, res) {
    const { id } = req.params;
    AulaIdSchema.parse(id);
    
    const validatedData = AulaUpdateSchema.parse(req.body);
    
    const data = await this.service.atualizar({ 
      params: { id }, 
      body: validatedData 
    });
    return CommonResponse.success(res, data, HttpStatusCodes.OK, messages.UPDATE_SUCCESS);
  }

  // DELETE /aulas/:id
  async deletar(req, res) {
    const { id } = req.params;
    AulaIdSchema.parse(id);

    const data = await this.service.deletar({ params: { id } });
    return CommonResponse.success(res, data, HttpStatusCodes.OK, messages.DELETE_SUCCESS);
  }

  // GET /aulas/paginado
  async listarPaginado(req, res) {
    const query = req.query || {};
    if (Object.keys(query).length !== 0) {
      await AulaQuerySchema.parseAsync(query);
    }

    const data = await this.service.listarPaginado({ query });
    return CommonResponse.success(res, data);
  }
}

export default AulaController;