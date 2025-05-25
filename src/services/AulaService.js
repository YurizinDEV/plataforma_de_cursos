import AulaRepository from "../repositories/AulaRepository.js";
import CursoRepository from "../repositories/CursoRepository.js";
import { CustomError, HttpStatusCodes } from '../utils/helpers/index.js';

class AulaService {
  constructor() {
    this.repository = new AulaRepository();
  }

  async listar({ params, query }) {
    if (params?.id) {
      return await this.repository.buscarPorId(params.id);
    }
    return await this.repository.listar(query);
  }

  async criar(aulaData) {
    const curso = await CursoRepository.buscarPorId(aulaData.cursoId);
    if (!curso) {
      throw new CustomError(messages.NOT_FOUND, HttpStatusCodes.NOT_FOUND);
    }

    const aulaExistente = await this.repository.verificarExistenciaPorCurso(
      aulaData.cursoId,
      aulaData.titulo
    );
    if (aulaExistente) {
      throw new CustomError(messages.ALREADY_EXISTS, HttpStatusCodes.CONFLICT);
    }

    return await this.repository.criar(aulaData);
  }

  async acessar(id) {
    const aula = await this.repository.buscarPorId(id);
    if (!aula) {
      throw new CustomError(messages.NOT_FOUND, HttpStatusCodes.NOT_FOUND);
    }
    return aula;
  }

  async atualizar(id, aulaData) {
    const aula = await this.repository.buscarPorId(id);
    if (!aula) {
      throw new CustomError(messages.NOT_FOUND, HttpStatusCodes.NOT_FOUND);
    }
    return await this.repository.atualizar(id, aulaData);
  }

  async deletar(id) {
    const aula = await this.repository.buscarPorId(id);
    if (!aula) {
      throw new CustomError(messages.NOT_FOUND, HttpStatusCodes.NOT_FOUND);
    }
    return await this.repository.deletar(id);
  }

  async listarPaginado({ query }) {
    return await this.repository.listarPaginado({
      page: query.page || 1,
      limit: query.limit || 10,
      ...query
    });
  }
}

export default AulaService;