import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import AuthenticationError from '../utils/errors/AuthenticationError.js';
import TokenExpiredError from '../utils/errors/TokenExpiredError.js';
import { CustomError } from '../utils/helpers/index.js';
import AuthService from '../services/AuthService.js';
import { Console } from 'console';

class AuthMiddleware {
    constructor() {
        this.service = new AuthService();
        this.handle = this.handle.bind(this);
    }

    _getTokenAndSecret(req) {
        const authHeader = req.headers?.authorization ?? null;
        if (authHeader) {
            const parts = authHeader.split(' ');
            const token = parts.length === 2 ? parts[1] : parts[0];
            return {
                token,
                secret: process.env.JWT_SECRET_ACCESS_TOKEN
            };
        }

        if (req.query?.token) {
            return {
                token: req.query.token,
                secret: process.env.JWT_SECRET_PASSWORD_RECOVERY
            };
        }

        throw new AuthenticationError('Token não informado!');
    }

    async handle(req, res, next) {
        try {
            const { token, secret } = this._getTokenAndSecret(req);

            const decoded = await promisify(jwt.verify)(token, secret);

            if (!decoded) {
                throw new TokenExpiredError('Token JWT expirado, tente novamente.');
            }

            if (secret === process.env.JWT_SECRET_ACCESS_TOKEN) {
                const tokenData = await this.service.carregatokens(decoded.id);

                if (!tokenData?.data?.refreshtoken) {
                    throw new CustomError({
                        statusCode: 401,
                        errorType: 'unauthorized',
                        field: 'Token',
                        details: [],
                        customMessage: 'Refresh token inválido, autentique-se novamente!'
                    });
                }
            }

            req.user_id = decoded.id;
            next();
        } catch (err) {
            if (err.name === 'JsonWebTokenError') {
                return next(new AuthenticationError('Token JWT inválido!'));
            }
            if (err.name === 'TokenExpiredError') {
                return next(new TokenExpiredError('Token JWT expirado, faça login novamente.'));
            }
            return next(err);
        }
    }
}

export default new AuthMiddleware().handle;
