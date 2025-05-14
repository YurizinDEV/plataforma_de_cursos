// src/services/QuestionarioService.js
import QuestionarioRepository from '../repositories/QuestionarioRepository.js';

class QuestionarioService {
    async getQuestionarioById(id, userId) {
        return await QuestionarioRepository.getQuestionarioById(id, userId);
    }

    async submeterRespostas(id, respostas, userId) {
        // Verificar validações específicas aqui
        return await QuestionarioRepository.saveRespostas(id, respostas, userId);
    }
}

export default new QuestionarioService();