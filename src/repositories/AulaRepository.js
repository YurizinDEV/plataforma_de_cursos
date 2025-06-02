import Aula from "../models/Aula.js";
import AulaFilterBuilder from "./filters/AulaFilterBuilder.js";
import { CustomError, HttpStatusCodes, messages } from "../utils/helpers/index.js";

class AulaRepository {
    constructor() {
        this.model = Aula;
    }

    async criar(aulaData) {
            const novaAula = new this.model(aulaData);
            return await novaAula.save();
    }

    async buscarPorId(id) {
        const aula = await this.model.findById(id);
        if (!aula) {
            throw new CustomError('Aula não encontrada', HttpStatusCodes.NOT_FOUND);
        }
        return aula;
    }

    async verificarExistenciaPorCurso(cursoId, titulo) {
        return await this.model.findOne({ cursoId, titulo });
    }

    async listar(filters = {}) {
        const query = new AulaFilterBuilder()
            .porTitulo(filters.titulo)
            .porCursoId(filters.cursoId)
            .build();

        return await Aula.find(query);
    }

    async atualizar(id, dadosAtualizados) {
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
    }

    async deletar(id) {
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
}
}

export default AulaRepository;