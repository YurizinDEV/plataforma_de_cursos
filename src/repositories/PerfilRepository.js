// src/repositories/PerfilRepository.js

class PerfilRepository {
    async getPerfil(userId) {
        const [perfil] = await db('profiles').where({ user_id: userId });
        return perfil;
    }

    async updatePerfil(userId, data) {
        await db('profiles').where({ user_id: userId }).update(data);
        return this.getPerfil(userId); // Retorna o perfil atualizado
    }
}

export default new PerfilRepository();