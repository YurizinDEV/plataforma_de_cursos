// src/services/CursoService.js
import CursoRepository from '../repositories/CursoRepository.js';

class CursoService {
    async getAllCursos(user) {
        return await CursoRepository.getAllCursos(user);
    }

    async getCursoById(id, user) {
        return await CursoRepository.getCursoById(id, user);
    }

    async matricularUsuario(userId, cursoId) {
        return await CursoRepository.matricularUsuario(userId, cursoId);
    }
}

export default new CursoService();