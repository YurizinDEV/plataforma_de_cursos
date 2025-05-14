// src/services/AulaService.js
import AulaRepository from '../repositories/AulaRepository.js';

class AulaService {
    async getAulaContent(aulaId, userId) {
        return await AulaRepository.getAulaContent(aulaId, userId);
    }
}

export default new AulaService();