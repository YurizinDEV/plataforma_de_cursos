import CursoRepository from '../repositories/CursoRepository.js';
import { CustomError, messages } from '../utils/helpers/index.js';

class CursoService {
    constructor() {
        this.repository = new CursoRepository();
    }

    async listar(req) {
        const pagina = parseInt(req.query.page) || 1; // Paginação padrão
        const limite = parseInt(req.query.limit) || 10; // Limite padrão

        const cursos = await this.repository.listar({ page: pagina, limit: limite });
        return cursos;
    }

    async criar(dadosCurso) {
        const cursoExistente = await this.repository.buscarPorTitulo(dadosCurso.titulo);
        if (cursoExistente) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'titulo',
                details: [{ path: 'titulo', message: 'Título de curso já está em uso.' }],
                customMessage: 'Título de curso já está em uso.',
            });
        }
        return await this.repository.criar(dadosCurso);
    }

    async atualizar(id, dadosAtualizados) {
        await this.repository.buscarPorId(id); // Verifica se o curso existe
        return await this.repository.atualizar(id, dadosAtualizados);
    }

    async deletar(id) {
        await this.repository.buscarPorId(id); // Verifica se o curso existe
        return await this.repository.deletar(id);
    }
}

export default CursoService;