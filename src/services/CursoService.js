import CursoRepository from '../repositories/CursoRepository.js';

class CursoService {
    constructor() {
        this.repository = new CursoRepository();
    }
    async listar(req) {
        const data = await this.repository.listar(req);
        return data;
    }
}

export default CursoService;