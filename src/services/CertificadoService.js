// src/services/CertificadoService.js
import CertificadoRepository from '../repositories/CertificadoRepository.js';

class CertificadoService {
    async getCertificado(userId, cursoId) {
        return await CertificadoRepository.getCertificado(userId, cursoId);
    }
}

export default new CertificadoService();