import jwt from 'jsonwebtoken';
import PermissionService from '../services/PermissionService.js';
import Rota from '../models/Rota.js';
import { CustomError, errorHandler, messages } from '../utils/helpers/index.js';

const JWT_SECRET_ACCESS_TOKEN = process.env.JWT_SECRET_ACCESS_TOKEN;

class AuthPermission {
  constructor() {
    this.jwt = jwt;
    this.permissionService = new PermissionService();
    this.Rota = Rota;
    this.JWT_SECRET_ACCESS_TOKEN = JWT_SECRET_ACCESS_TOKEN;
    this.messages = messages;

    this.handle = this.handle.bind(this);
  }

  async handle(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new CustomError({
          statusCode: 401,
          errorType: 'authenticationError',
          field: 'Authorization',
          details: [],
          customMessage: this.messages.error.resourceNotFound('Token')
        });
      }

      const token = authHeader.split(' ')[1];

      let decoded;
      try {
        decoded = this.jwt.verify(token, this.JWT_SECRET_ACCESS_TOKEN);
      } catch (err) {
        throw new CustomError({
          statusCode: 401,
          errorType: 'authenticationError',
          field: 'Token',
          details: [],
          customMessage: this.messages.error.resourceNotFound('Token')
        });
      }
      const userId = decoded.id;

      const rotaReq = req.url.split('/').filter(Boolean)[0].split('?')[0];

      const dominioReq = `localhost`;

      const rotaDB = await this.Rota.findOne({ rota: rotaReq, dominio: dominioReq });
      if (!rotaDB) {
        throw new CustomError({
          statusCode: 404,
          errorType: 'resourceNotFound',
          field: 'Rota',
          details: [],
          customMessage: this.messages.error.resourceNotFound('Rota')
        });
      }

      const metodoMap = {
        'GET': 'buscar',
        'POST': 'enviar',
        'PUT': 'substituir',
        'PATCH': 'modificar',
        'DELETE': 'excluir'
      };

      const metodo = metodoMap[req.method];
      if (!metodo) {
        throw new CustomError({
          statusCode: 405,
          errorType: 'methodNotAllowed',
          field: 'Método',
          details: [],
          customMessage: this.messages.error.resourceNotFound('Método.')
        });
      }

      if (!rotaDB.ativo || !rotaDB[metodo]) {
        throw new CustomError({
          statusCode: 403,
          errorType: 'forbidden',
          field: 'Rota',
          details: [],
          customMessage: this.messages.error.resourceNotFound('Rota.')
        });
      }

      const hasPermission = await this.permissionService.hasPermission(
        userId,
        rotaReq.toLowerCase(),
        rotaDB.dominio,
        metodo
      );

      if (!hasPermission) {
        throw new CustomError({
          statusCode: 403,
          errorType: 'forbidden',
          field: 'Permissão',
          details: [],
          customMessage: this.messages.error.resourceNotFound('Permissão')
        });
      }

      req.user = { id: userId };

      next();
    } catch (error) {
      errorHandler(error, req, res, next);
    }
  }
}

export default new AuthPermission().handle;
