import AulaRepository from "../repositories/AulaRepository.js";
import CursoRepository from "../repositories/CursoRepository.js";

class AulaService {
    async criarAula(aulaData) {
        // O curso já existe?
        const curso = await CursoRepository.buscarPorId(aulaData.cursoId);
        if (!curso) throw new Error("Curso não encontrado");

        // A aula já existe?
        const aulaExistente = await AulaRepository.verificarExistenciaPorCurso(
            aulaData.cursoId, 
            aulaData.titulo
        );
        if (aulaExistente) throw new Error("Esta aula já existe neste curso");

        return await AulaRepository.criar(aulaData);
    }

    async buscarPorId(id) {
        const aula = await AulaRepository.buscarPorId(id);
        if (!aula) throw new Error("Aula não encontrada");
        return aula;
    }

    async listar(filters) {
        return await AulaRepository.listar(filters);
    }

    async listarPaginado({ page = 1, limit = 10, ...filters }) {
        return await AulaRepository.listarPaginado({ 
            page: parseInt(page), 
            limit: parseInt(limit), 
            ...filters 
        });
    }
}

export default new AulaService();