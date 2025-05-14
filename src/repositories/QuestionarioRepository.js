// src/repositories/QuestionarioRepository.js

class QuestionarioRepository {
    async getQuestionarioById(id, userId) {
        const questionario = await db('questionarios').where({ id }).first();
        if (!questionario) throw new Error('Questionário não encontrado.');
        return questionario;
    }

    async saveRespostas(id, respostas, userId) {
        // Implementar logica para salvar as respostas no banco de dados
        return { sucesso: true, mensagem: 'Respostas salvas com sucesso!' };
    }
}

export default new QuestionarioRepository();