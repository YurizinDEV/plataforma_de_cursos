import AulaRepository from '../repositories/AulaRepository.js';
import CursoRepository from '../repositories/CursoRepository.js';
import { CustomError, messages, HttpStatusCodes } from '../utils/helpers/index.js';

class AulaService {
    constructor() {
        this.cursoRepository = new CursoRepository();
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
        const curso = await this.cursoRepository.buscarPorId(body.cursoId);
        
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
    
    const aulaExistente = await this.repository.buscarPorId(id);
    if (!aulaExistente) {
        throw new CustomError(messages.NOT_FOUND, HttpStatusCodes.NOT_FOUND);
    }

    return await this.repository.atualizar(id, body);
}

    async deletar(req) {
    const { params: { id } } = req;
    
    const aulaExistente = await this.repository.buscarPorId(id);
    if (!aulaExistente) {
        throw new CustomError(messages.NOT_FOUND, HttpStatusCodes.NOT_FOUND);
    }
    
    return await this.repository.deletar(id);
}
}

export default AulaService;