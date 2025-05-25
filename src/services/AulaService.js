import AulaRepository from '../repositories/AulaRepository.js';
import CursoRepository from '../repositories/CursoRepository.js';
import { CustomError, messages, HttpStatusCodes } from '../utils/helpers/index.js';

class AulaService {
    constructor() {
        this.repository = new AulaRepository();
    }

    async listar(req) {
        const { params, query } = req;
        
        if (params?.id) {
            const aula = await this.repository.buscarPorId(params.id);
            if (!aula) {
                throw new CustomError(messages.NOT_FOUND, HttpStatusCodes.NOT_FOUND);
            }
            return aula;
        }
        
        return await this.repository.listar(query);
    }

    async criar(req) {
        const { body } = req;
        const curso = await CursoRepository.buscarPorId(body.cursoId);
        
        if (!curso) {
            throw new CustomError('Curso não encontrado', HttpStatusCodes.NOT_FOUND);
        }

        const aulaExistente = await this.repository.verificarExistenciaPorCurso(
            body.cursoId, 
            body.titulo
        );
        
        if (aulaExistente) {
            throw new CustomError('Esta aula já existe neste curso', HttpStatusCodes.CONFLICT);
        }

        return await this.repository.criar(body);
    }

    async atualizar(req) {
        const { params: { id }, body } = req;
        const aula = await this.repository.buscarPorId(id);
        
        if (!aula) {
            throw new CustomError(messages.NOT_FOUND, HttpStatusCodes.NOT_FOUND);
        }
        
        return await this.repository.atualizar(id, body);
    }

    async deletar(req) {
        const { params: { id } } = req;
        const aula = await this.repository.buscarPorId(id);
        
        if (!aula) {
            throw new CustomError(messages.NOT_FOUND, HttpStatusCodes.NOT_FOUND);
        }
        
        return await this.repository.deletar(id);
    }

    async listarPaginado(req) {
        const { query } = req;
        return await this.repository.listarPaginado({
            page: query.page || 1,
            limit: query.limit || 10,
            ...query
        });
    }
}

export default AulaService;