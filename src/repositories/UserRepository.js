// src/repositories/UserRepository.js
import db from '../config/database.js'; // Importa a configuração do banco de dados

class UserRepository {
    async findByEmail(email) {
        const [user] = await db('users').where({ email });
        return user;
    }

    async save(userData) {
        const [newUser] = await db('users').insert(userData).returning('*');
        return newUser;
    }

    // Outros métodos para atualizar, deletar ou listar usuários
}

export default new UserRepository();