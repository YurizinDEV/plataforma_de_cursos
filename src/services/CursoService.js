import CursoRepository from '../repositories/CursoRepository.js';
import {
    CustomError,
    HttpStatusCodes,
    messages
} from '../utils/helpers/index.js';

class CursoService {
    constructor() {
        this.repository = new CursoRepository();
    }

    async listar(req) {
        const data = await this.repository.listar(req);
        return data;
    }

    async criar(dadosCurso) {
        await this.validateTitulo(dadosCurso.titulo);
        return await this.repository.criar(dadosCurso);
    }

    async atualizar(id, dadosAtualizados) {
        await this.ensureCursoExists(id);

        if (dadosAtualizados.titulo) {
            await this.validateTitulo(dadosAtualizados.titulo, id);
        }
        return await this.repository.atualizar(id, dadosAtualizados);
    }

    async deletar(id) {
        await this.ensureCursoExists(id);
        return await this.repository.deletar(id);
    }

    // Métodos auxiliares     
    async validateTitulo(titulo, id = null) {
        const cursoExistente = await this.repository.buscarPorTitulo(titulo, {
            throwOnNotFound: false
        });
        
        if (!cursoExistente) {
            return;
        }
        
        if (!id || cursoExistente._id.toString() !== id.toString()) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'titulo',
                details: [{
                    path: 'titulo',
                    message: 'Título de curso já está em uso.'
                }],
                customMessage: 'Título de curso já está em uso.',
            });
        }
    }

    async ensureCursoExists(id) {
        const cursoExistente = await this.repository.buscarPorId(id);
        if (!cursoExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Curso',
                details: [],
                customMessage: messages.error.resourceNotFound('Curso'),
            });
        }
        return cursoExistente;
    }
}

export default CursoService;