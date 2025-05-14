// src/services/PerfilService.js
import PerfilRepository from '../repositories/PerfilRepository.js';

class PerfilService {
    async getPerfil(userId) {
        return await PerfilRepository.getPerfil(userId);
    }

    async updatePerfil(userId, data) {
        // Realizar validações nos dados aqui
        return await PerfilRepository.updatePerfil(userId, data);
    }
}

export default new PerfilService();