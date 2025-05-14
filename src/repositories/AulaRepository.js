// src/repositories/AulaRepository.js

class AulaRepository {
    async getAulaContent(aulaId, userId) {
        const [aula] = await db('lessons').where({ id: aulaId });
        if (!aula) throw new Error('Aula não encontrada.');
        // Verifique se o usuário está matriculado e outros critérios de autorização aqui
        return aula;
    }
}

export default new AulaRepository();