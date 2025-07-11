import Rota from '../models/Rota.js';
import {
    CustomError,
    HttpStatusCodes
} from '../utils/helpers/index.js';

class RotaRepository {
    constructor() {
        this.model = Rota;
    }

    async criar(dados) {
        const rota = new this.model(dados);
        return await rota.save();
    }

    async listar(options = {}) {
        const {
            page = 1, limit = 10, rota, dominio
        } = options;

        let query = {};
        if (rota) {
            query.rota = {
                $regex: rota,
                $options: 'i'
            };
        }
        if (dominio) {
            query.dominio = dominio;
        }

        const opcoesConsulta = {
            page,
            limit,
            sort: {
                createdAt: -1
            },
            lean: true
        };

        return await this.model.paginate(query, opcoesConsulta);
    }

    async buscarPorId(id) {
        const rota = await this.model.findById(id);
        if (!rota) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Rota',
                details: [],
                customMessage: 'Rota não encontrada',
            });
        }
        return rota;
    }

    async atualizar(id, dados) {
        const rota = await this.model.findByIdAndUpdate(id, dados, {
            new: true,
            runValidators: true
        });
        if (!rota) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Rota',
                details: [],
                customMessage: 'Rota não encontrada',
            });
        }
        return rota;
    }

    async deletar(id) {
        const rota = await this.model.findByIdAndDelete(id);
        if (!rota) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Rota',
                details: [],
                customMessage: 'Rota não encontrada',
            });
        }
        return rota;
    }
}

export default RotaRepository;