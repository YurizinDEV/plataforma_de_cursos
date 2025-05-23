import CursoModel from '../models/Curso.js';
import { CustomError, messages } from '../utils/helpers/index.js';

class CursoRepository {
    async criar(dadosCurso) {
        const curso = new CursoModel(dadosCurso);
        return await curso.save();
    }

    async buscarPorId(id) {
        const curso = await CursoModel.findById(id);
        if (!curso) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Curso',
                details: [],
                customMessage: messages.error.resourceNotFound('Curso')
            });
        }
        return curso;
    }

        async buscarPorTitulo(titulo) {
        const curso = await CursoModel.findOne({ titulo });
        return curso;
    }


    async listar(paginationOptions = {}) {
        return await CursoModel.paginate({}, paginationOptions);
    }

    async atualizar(id, dadosAtualizados) {
        const cursoAtualizado = await CursoModel.findByIdAndUpdate(id, dadosAtualizados, { new: true });
        if (!cursoAtualizado) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Curso',
                details: [],
                customMessage: messages.error.resourceNotFound('Curso')
            });
        }
        return cursoAtualizado;
    }

    async deletar(id) {
        const curso = await CursoModel.findByIdAndDelete(id);
        return curso;
    }
}

export default CursoRepository;