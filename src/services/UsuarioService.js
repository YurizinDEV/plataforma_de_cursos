//UsuarioService.js

import UsuarioRepository from '../repositories/UsuarioRepository.js';
import bcrypt from 'bcrypt';
import { CustomError, HttpStatusCodes, messages } from '../utils/helpers/index.js';

class UsuarioService {
    constructor() {
        this.repository = new UsuarioRepository();
    }

    async listar(req) {
        const data = await this.repository.listar(req); 
        return data;
    }

    async criar(parsedData) {
        await this.validateEmail(parsedData.email);
        if (parsedData.senha) {
            const saltRounds = 10;
            parsedData.senha = await bcrypt.hash(parsedData.senha, saltRounds);
        }
        const data = await this.repository.criar(parsedData);
        return data;
    }

    async atualizar(id, parsedData) {
        delete parsedData.senha; // Não permite alterar a senha diretamente
        delete parsedData.email;
        await this.ensureUserExists(id);
        const data = await this.repository.atualizar(id, parsedData);
        return data;
    }

    async deletar(id) {
        await this.ensureUserExists(id);
        const data = await this.repository.deletar(id);
        return data;
    }

    //Metódos auxiliares

    async validateEmail(email, id = null) {
        const usuarioExistente = await this.repository.buscarPorEmail(email, id);
        if (usuarioExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'email',
                details: [{ path: 'email', message: 'Email já está em uso.' }],
                customMessage: 'Email já está em uso.',
            });
        }
    }

    async ensureUserExists(id) {
        const usuarioExistente = await this.repository.buscarPorId(id);
        if (!usuarioExistente) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário'),
            });
        }
        return usuarioExistente;
    }
}

export default UsuarioService;