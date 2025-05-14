// src/repositories/CursoRepository.js

class CursoRepository {
    async getAllCursos(user) {
        if (user.type === 'student') {
            return await db('courses').where({ available: true }); // Apenas cursos disponíveis
        }
        return await db('courses'); // Para professores, retornar todos os cursos
    }

    async getCursoById(id, user) {
        const [curso] = await db('courses').where({ id });
        if (!curso) throw new Error('Curso não encontrado.');
        return curso; // Adicione lógicas de autorização se necessário
    }

    async matricularUsuario(userId, cursoId) {
        const [matricula] = await db('enrollments').insert({
            user_id: userId,
            course_id: cursoId,
            created_at: new Date()
        }).returning('*');
        return matricula;
    }
}

export default new CursoRepository();