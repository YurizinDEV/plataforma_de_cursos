import Aula from "../models/Aula.js";
import AulaFilterBuilder from "./filters/AulaFilterBuilder.js";

class AulaRepository {
    async criar(aulaData) {
        const novaAula = new Aula(aulaData);
        return await novaAula.save();
    }

    async buscarPorId(id) {
        return await Aula.findById(id);
    }

    async verificarExistenciaPorCurso(cursoId, titulo) {
        return await Aula.findOne({ cursoId, titulo });
    }

    async listar(filters = {}) {
        const query = new AulaFilterBuilder()
            .porTitulo(filters.titulo)
            .porCursoId(filters.cursoId)
            .build();

        return await Aula.find(query);
    }

    async listarPaginado({ page = 1, limit = 10, ...filters }) {
        const query = new AulaFilterBuilder()
            .porTitulo(filters.titulo)
            .porCursoId(filters.cursoId)
            .build();

        return await Aula.paginate(query, { 
            page, 
            limit, 
            sort: { createdAt: -1 } 
        });
    }
}

export default new AulaRepository();