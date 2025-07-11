import Grupo from '../models/Grupo.js';
import { CustomError, HttpStatusCodes } from '../utils/helpers/index.js';

class GrupoRepository {
    constructor() {
        this.model = Grupo;
    }

    async criar(dados) {
        const grupo = new this.model(dados);
        return await grupo.save();
    }

    async listar(options = {}) {
        const { page = 1, limit = 10, nome } = options;
        
        let query = {};
        if (nome) {
            query.nome = { $regex: nome, $options: 'i' };
        }

        const opcoesConsulta = {
            page,
            limit,
            sort: { createdAt: -1 },
            lean: true
        };

        return await this.model.paginate(query, opcoesConsulta);
    }

    async buscarPorId(id) {
        const grupo = await this.model.findById(id);
        if (!grupo) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Grupo',
                details: [],
                customMessage: 'Grupo não encontrado',
            });
        }
        return grupo;
    }

    async buscarPorNome(nome) {
        const grupo = await this.model.findOne({ nome });
        return grupo; // Retorna o grupo se encontrar, null se não encontrar
    }

    async atualizar(id, dados) {
        const grupo = await this.model.findByIdAndUpdate(id, dados, { 
            new: true, 
            runValidators: true 
        });
        if (!grupo) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Grupo',
                details: [],
                customMessage: 'Grupo não encontrado',
            });
        }
        return grupo;
    }

    async deletar(id) {
        const grupo = await this.model.findByIdAndDelete(id);
        if (!grupo) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Grupo',
                details: [],
                customMessage: 'Grupo não encontrado',
            });
        }
        return grupo;
    }
}

export default GrupoRepository;
