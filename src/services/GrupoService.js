import GrupoRepository from '../repositories/GrupoRepository.js';
import { CustomError, CommonResponse, HttpStatusCodes } from '../utils/helpers/index.js';

class GrupoService {
    constructor() {
        this.repository = new GrupoRepository();
    }

    async criar(dados) {
        const grupoExistente = await this.repository.buscarPorNome(dados.nome);
        if (grupoExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.CONFLICT.code,
                errorType: 'duplicateKey',
                field: 'nome',
                details: [],
                customMessage: 'Grupo com este nome já existe'
            });
        }
        const grupo = await this.repository.criar(dados);
        return grupo;
    }

    async listar(req) {
        const { page, limit, nome } = req.query;
        const id = req.params.id || null;

        if (id) {
            const grupo = await this.repository.buscarPorId(id);
            return grupo;
        }

        const grupos = await this.repository.listar({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            nome
        });

        return grupos;
    }

    async atualizar(id, dados) {
        const grupo = await this.repository.atualizar(id, dados);
        return grupo;
    }

    async deletar(id) {
        const resultado = await this.repository.deletar(id);
        return resultado;
    }
}

export default GrupoService;
