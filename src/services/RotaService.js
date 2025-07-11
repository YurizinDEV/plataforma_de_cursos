import RotaRepository from '../repositories/RotaRepository.js';
import { CustomError, CommonResponse, HttpStatusCodes } from '../utils/helpers/index.js';

class RotaService {
    constructor() {
        this.repository = new RotaRepository();
    }

    async criar(dados) {
        try {
            const rota = await this.repository.criar(dados);
            return rota;
        } catch (error) {
            if (error.code === 11000) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.CONFLICT.code,
                    errorType: 'duplicateKey',
                    field: 'rota',
                    details: [],
                    customMessage: 'Rota com este nome e domínio já existe'
                });
            }
            throw error;
        }
    }

    async listar(req) {
        const { page, limit, rota, dominio } = req.query;
        const id = req.params.id || null;

        if (id) {
            const rotaData = await this.repository.buscarPorId(id);
            return rotaData;
        }

        const rotas = await this.repository.listar({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            rota,
            dominio
        });

        return rotas;
    }

    async atualizar(id, dados) {
        const rota = await this.repository.atualizar(id, dados);
        return rota;
    }

    async deletar(id) {
        const resultado = await this.repository.deletar(id);
        return resultado;
    }
}

export default RotaService;
