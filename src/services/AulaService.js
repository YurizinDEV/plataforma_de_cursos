import AulaRepository from '../repositories/AulaRepository.js';
import CursoRepository from '../repositories/CursoRepository.js';
import { CustomError, messages, HttpStatusCodes } from '../utils/helpers/index.js';

class AulaService {
    constructor() {
        this.cursoRepository = new CursoRepository();
        this.repositoryAula = new AulaRepository();
    }

    async listar(req) {
        const { params, query } = req;
        
        if (params?.id) {
            const aula = await this.repositoryAula.buscarPorId(params.id);
            if (!aula) {
                throw new CustomError(messages.NOT_FOUND, HttpStatusCodes.NOT_FOUND);
            }
            return aula;
        }
        
        return await this.repositoryAula.listar(query);
    }

    async buscarPorId({ params }) {
  const { id } = params;
  const aula = await this.repositoryAula.buscarPorId(id);
  if (!aula) {
  throw new CustomError({
    statusCode: HttpStatusCodes.NOT_FOUND.code,
    errorType: 'resourceNotFound',
    customMessage: 'Aula não encontrada'
  });
}
  return aula;
}

    async criar({ body }) {
    const curso = await this.cursoRepository.buscarPorId(body.cursoId);
    if (!curso) {
      throw new CustomError({
        customMessage: 'Curso não encontrado',
        statusCode: HttpStatusCodes.NOT_FOUND
      });
    }

        const aulaExistente = await this.repositoryAula.buscarPorTitulo(body.titulo, body.cursoId);
    if (aulaExistente) {
      throw new CustomError({
        customMessage: 'Esta aula já existe neste curso',
        statusCode: HttpStatusCodes.CONFLICT
      });
    }

    return await this.repositoryAula.criar(body);
  }

    async atualizar({ params: { id }, body }) {
        const aulaExistente = await this.repositoryAula.buscarPorId(id);
        if (!aulaExistente) {
            throw new CustomError(messages.NOT_FOUND, HttpStatusCodes.NOT_FOUND);
        }
        return await this.repositoryAula.atualizar(id, body);
    }

    async deletar({ params: { id } }) {
        const aulaExistente = await this.repositoryAula.buscarPorId(id);
        if (!aulaExistente) {
            throw new CustomError(messages.NOT_FOUND, HttpStatusCodes.NOT_FOUND);
        }
        return await this.repositoryAula.deletar(id);
    }
}

export default AulaService;