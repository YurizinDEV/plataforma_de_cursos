import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
    CommonResponse,
    CustomError,
    HttpStatusCodes,
    errorHandler,
    messages,
    StatusService,
    asyncWrapper
} from '../utils/helpers/index.js';
import tokenUtil from '../utils/TokenUtil.js';
import {
    v4 as uuid
} from 'uuid';
import AuthHelper from '../utils/AuthHelper.js';

import UsuarioRepository from '../repositories/UsuarioRepository.js';

class AuthService {
    constructor({
        tokenUtil: injectedTokenUtil
    } = {}) {
        this.TokenUtil = injectedTokenUtil || tokenUtil;
        this.repository = new UsuarioRepository();
    }

    async carregatokens(id, token) {
        const data = await this.repository.buscarPorId(id, {
            includeTokens: true
        });
        return {
            data
        };
    }

    async revoke(id) {
        const data = await this.repository.removeToken(id);
        return {
            data
        };
    }

    async logout(id) {
        const data = await this.repository.removeToken(id);
        return {
            data
        };
    }

    async login(body) {
        const userEncontrado = await this.repository.buscarPorEmail(body.email);
        if (!userEncontrado) {

            throw new CustomError({
                statusCode: 401,
                errorType: 'notFound',
                field: 'Email',
                details: [],
                customMessage: messages.error.unauthorized('Senha ou Email')
            });
        }

        const senhaValida = await bcrypt.compare(body.senha, userEncontrado.senha);
        if (!senhaValida) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'unauthorized',
                field: 'Senha',
                details: [],
                customMessage: messages.error.unauthorized('Senha ou Email')
            });
        }

        const accesstoken = await this.TokenUtil.generateAccessToken(userEncontrado._id);

        const userComTokens = await this.repository.buscarPorId(userEncontrado._id, {
            includeTokens: true
        });
        let refreshtoken = userComTokens.refreshtoken;

        if (refreshtoken) {
            try {
                jwt.verify(refreshtoken, process.env.JWT_SECRET_REFRESH_TOKEN);
            } catch (error) {
                if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
                    refreshtoken = await this.TokenUtil.generateRefreshToken(userEncontrado._id);
                } else {
                    throw new CustomError({
                        statusCode: 500,
                        errorType: 'serverError',
                        field: 'Token',
                        details: [],
                        customMessage: messages.error.unauthorized('falha na geração do token')
                    });
                }
            }
        } else {
            refreshtoken = await this.TokenUtil.generateRefreshToken(userEncontrado._id);
        }

        await this.repository.armazenarTokens(userEncontrado._id, accesstoken, refreshtoken);

        const userLogado = await this.repository.buscarPorEmail(body.email);
        delete userLogado.senha;
        const userObjeto = userLogado.toObject();

        return {
            user: {
                accesstoken,
                refreshtoken,
                ...userObjeto
            }
        };
    }

    async recuperaSenha(body) {

        const userEncontrado = await this.repository.buscarPorEmail(body.email);

        if (!userEncontrado) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                field: 'Email',
                details: [],
                customMessage: HttpStatusCodes.NOT_FOUND.message
            });
        }

        const generateCode = () => Math.random()
            .toString(36)
            .replace(/[^a-z0-9]/gi, '')
            .slice(0, 4)
            .toUpperCase();

        let codigoRecuperaSenha = generateCode();

        let codigoExistente =
            await this.repository.buscarPorCodigoRecuperacao(codigoRecuperaSenha);

        while (codigoExistente) {
            codigoRecuperaSenha = generateCode();
            codigoExistente =
                await this.repository.buscarPorCodigoRecuperacao(codigoRecuperaSenha);
        }

        const tokenUnico =
            await this.TokenUtil.generatePasswordRecoveryToken(userEncontrado._id);

        const expMs = Date.now() + 60 * 60 * 1000;
        const data = await this.repository.atualizar(userEncontrado._id, {
            tokenUnico,
            codigo_recupera_senha: codigoRecuperaSenha,
            exp_codigo_recupera_senha: new Date(expMs).toISOString()
        });

        if (!data) {
            throw new CustomError({
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                field: 'Recuperação de Senha',
                details: [],
                customMessage: HttpStatusCodes.INTERNAL_SERVER_ERROR.message
            });
        }

        const resetUrl = `https://edurondon.tplinkdns.com/auth/?token=${tokenUnico}`;
        const emailData = {
            to: userEncontrado.email,
            subject: 'Redefinir senha',
            template: 'password-reset',
            data: {
                name: userEncontrado.nome,
                resetUrl: resetUrl,
                expirationMinutes: 60,
                year: new Date().getFullYear(),
                company: process.env.COMPANY_NAME || 'Auth'
            }
        };

        const sendMail = async (emailData) => {
            const mailApiUrl = process.env.MAIL_API_URL || 'http://localhost:3001';
            const url = `${mailApiUrl}/emails/send?apiKey=${process.env.MAIL_API_KEY}`;

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(emailData)
                });

                if (!response.ok) {
                    throw new Error(`Erro ao enviar e-mail: ${response.status} ${response.statusText}`);
                }
                const responseData = await response.json();
            } catch (error) {
                console.error('Erro ao enviar e-mail:', error);
                throw new CustomError({
                    statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                    field: 'E-mail',
                    details: [],
                    customMessage: 'Erro ao enviar e-mail de recuperação de senha.'
                });
            }
        };

        await sendMail(emailData);

        return {
            message: 'Solicitação de recuperação de senha recebida. Um e-mail foi enviado com instruções.'
        };
    }

    async atualizarSenhaToken(tokenRecuperacao, senhaBody) {
        const usuarioId = await this.TokenUtil.decodePasswordRecoveryToken(
            tokenRecuperacao,
            process.env.JWT_SECRET_PASSWORD_RECOVERY
        );

        const senhaHasheada = await AuthHelper.hashPassword(senhaBody.senha);
        console.log('Senha hasheada:', senhaHasheada);

        const usuario = await this.repository.buscarPorTokenUnico(tokenRecuperacao);
        if (!usuario) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                field: 'Token',
                details: [],
                customMessage: "Token de recuperação já foi utilizado ou é inválido."
            });
        }

        const usuarioAtualizado = await this.repository.atualizarSenha(usuarioId, senhaHasheada);
        if (!usuarioAtualizado) {
            throw new CustomError({
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                field: 'Senha',
                details: [],
                customMessage: 'Erro ao atualizar a senha.'
            });
        }

        return {
            message: 'Senha atualizada com sucesso.'
        };
    }

    async atualizarSenhaCodigo(codigoRecuperaSenha, senhaBody) {

        const user = await this.repository.buscarPorCodigoRecuperacao(
            codigoRecuperaSenha
        );
        if (!user) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                field: 'Código de Recuperação',
                details: [],
                customMessage: 'Código de recuperação inválido ou não encontrado.'
            });
        }

        if (user.exp_codigo_recupera_senha < new Date()) {
            throw new CustomError({
                statusCode: HttpStatusCodes.UNAUTHORIZED.code,
                field: 'Código de Recuperação',
                details: [],
                customMessage: 'Código de recuperação expirado.'
            });
        }

        const senhaHasheada = await AuthHelper.hashPassword(senhaBody.senha);

        const atualizado = await this.repository.atualizarSenha(
            user._id,
            senhaHasheada
        );
        if (!atualizado) {
            throw new CustomError({
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                field: 'Senha',
                details: [],
                customMessage: 'Erro ao atualizar a senha.'
            });
        }

        return {
            message: 'Senha atualizada com sucesso.'
        };
    }


    async refresh(id, token) {
        const userEncontrado = await this.repository.buscarPorId(id, {
            includeTokens: true
        });

        if (!userEncontrado) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                field: 'Token',
                details: [],
                customMessage: HttpStatusCodes.NOT_FOUND.message
            });
        }

        if (userEncontrado.refreshtoken !== token) {
            throw new CustomError({
                statusCode: HttpStatusCodes.UNAUTHORIZED.code,
                errorType: 'invalidToken',
                field: 'Token',
                details: [],
                customMessage: messages.error.unauthorized('Token')
            });
        }

        const accesstoken = await this.TokenUtil.generateAccessToken(id);

        let refreshtoken = '';
        if (process.env.SINGLE_SESSION_REFRESH_TOKEN === 'true') {
            refreshtoken = await this.TokenUtil.generateRefreshToken(id);
        } else {
            refreshtoken = userEncontrado.refreshtoken;
        }

        await this.repository.armazenarTokens(id, accesstoken, refreshtoken);

        const userLogado = await this.repository.buscarPorId(id, {
            includeTokens: true
        });
        delete userLogado.senha;
        const userObjeto = userLogado.toObject();

        const userComTokens = {
            accesstoken,
            refreshtoken,
            ...userObjeto
        };

        return {
            user: userComTokens
        };
    }
}

export default AuthService;