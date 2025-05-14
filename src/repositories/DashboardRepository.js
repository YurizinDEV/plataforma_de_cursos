// src/repositories/DashboardRepository.js

class DashboardRepository {
    async getDashboardData(userId) {
        // Exemplo: Obtém dados do dashboard com base no tipo de usuário
        const courses = await db('courses').where({ user_id: userId }); // Ajuste conforme necessário
        // Aqui você pode buscar outras informações como notificações e progresso
        return { courses };
    }
}

export default new DashboardRepository();