// src/services/UserService.js
import UserRepository from '../repositories/UserRepository.js';
import bcrypt from 'bcrypt'; // Para hash e verificação de senhas

class UserService {
    async authenticateUser(email, password) {
        const user = await UserRepository.findByEmail(email);
        if (!user) throw new Error('Usuário não encontrado.');
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new Error('Senha incorreta.');
        
        // Gerar token (usando sua biblioteca de JWT aqui)
        const token = "token_gerado"; // Placeholder para token gerado
        return { token, userType: user.type }; // Retorna o tipo de usuário para redirecionamento
    }

    // Outros métodos para criar, atualizar e deletar usuários
}

export default new UserService();