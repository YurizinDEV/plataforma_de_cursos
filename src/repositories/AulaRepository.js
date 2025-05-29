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

    async atualizar(id, dadosAtualizados) {
        try {
            const aulaAtualizada = await Aula.findByIdAndUpdate(
                id,
                dadosAtualizados,
                { 
                    new: true,
                    runValidators: true
                }
            );

            if (!aulaAtualizada) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.NOT_FOUND.code,
                    errorType: 'resourceNotFound',
                    field: 'Aula',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Aula')
                });
            }

            return aulaAtualizada;
        } catch (error) {
            console.error('Erro ao atualizar aula:', error);
            throw error;
        }
    }

    async deletar(id) {
    try {
        const aulaDeletada = await Aula.findByIdAndDelete(id);
        
        if (!aulaDeletada) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Aula',
                details: [],
                customMessage: messages.error.resourceNotFound('Aula')
            });
        }
        
        return aulaDeletada;
    } catch (error) {
        console.error('Erro ao deletar aula:', error);
        throw error;
    }
}
}

export default AulaRepository;