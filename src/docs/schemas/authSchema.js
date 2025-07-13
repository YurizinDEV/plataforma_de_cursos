import { deepCopy, generateExample } from '../utils/schemaGenerate.js';

const authSchemas = {
    LoginRequest: {
        type: "object",
        properties: {
            email: { 
                type: "string", 
                format: "email",
                description: "Email do usuário",
                example: "admin@gmail.com"
            },
            senha: { 
                type: "string", 
                description: "Senha do usuário",
                minLength: 8,
                example: "Admin@1234"
            }
        },
        required: ["email", "senha"],
        description: "Schema para requisição de login"
    },

    SignupRequest: {
        type: "object",
        properties: {
            nome: { 
                type: "string", 
                description: "Nome completo do usuário",
                minLength: 3,
                example: "João Silva"
            },
            email: { 
                type: "string", 
                format: "email", 
                description: "Email do usuário",
                example: "joao@email.com"
            },
            senha: { 
                type: "string", 
                description: "Senha do usuário (mínimo 8 caracteres com letras maiúsculas, minúsculas, números e caracteres especiais)",
                minLength: 8,
                pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
                example: "MinhaSenh@123"
            }
        },
        required: ["nome", "email", "senha"],
        description: "Schema para requisição de cadastro de usuário"
    },

    RecoverPasswordRequest: {
        type: "object",
        properties: {
            email: { 
                type: "string", 
                format: "email",
                description: "Email do usuário para recuperação de senha",
                example: "usuario@email.com"
            }
        },
        required: ["email"],
        description: "Schema para requisição de recuperação de senha"
    },

    ResetPasswordRequest: {
        type: "object",
        properties: {
            token: { 
                type: "string", 
                description: "Token de recuperação de senha",
                example: "abc123def456ghi789"
            },
            novaSenha: { 
                type: "string", 
                description: "Nova senha do usuário (mínimo 8 caracteres)",
                minLength: 8,
                example: "NovaSenha@123"
            }
        },
        required: ["token", "novaSenha"],
        description: "Schema para redefinição de senha com token"
    },

    ResetPasswordCodeRequest: {
        type: "object",
        properties: {
            codigo: { 
                type: "string", 
                description: "Código de verificação recebido por email/SMS",
                example: "123456"
            },
            email: { 
                type: "string", 
                format: "email",
                description: "Email do usuário",
                example: "usuario@email.com"
            },
            novaSenha: { 
                type: "string", 
                description: "Nova senha do usuário (mínimo 8 caracteres)",
                minLength: 8,
                example: "NovaSenha@123"
            }
        },
        required: ["codigo", "email", "novaSenha"],
        description: "Schema para redefinição de senha com código"
    },

    TokenRequest: {
        type: "object",
        properties: {
            refreshtoken: { 
                type: "string", 
                description: "Refresh token do usuário",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh_token_payload.signature"
            }
        },
        required: ["refreshtoken"],
        description: "Schema para requisições que usam refresh token (logout, revoke, refresh)"
    },

    IntrospectRequest: {
        type: "object",
        properties: {
            accesstoken: { 
                type: "string", 
                description: "Access token para verificação",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access_token_payload.signature"
            }
        },
        required: ["accesstoken"],
        description: "Schema para requisição de validação de token"
    },

    LoginResponse: {
        type: "object",
        properties: {
            user: {
                type: "object",
                properties: {
                    _id: { 
                        type: "string", 
                        description: "ID único do usuário",
                        example: "64f8a9b123456789abcdef01"
                    },
                    nome: { 
                        type: "string", 
                        description: "Nome do usuário",
                        example: "Administrador"
                    },
                    email: { 
                        type: "string", 
                        format: "email",
                        description: "Email do usuário",
                        example: "admin@gmail.com"
                    },
                    ativo: { 
                        type: "boolean", 
                        description: "Status de ativação do usuário",
                        example: true
                    },
                    grupos: {
                        type: "array",
                        items: {
                            type: "string"
                        },
                        description: "Lista de IDs dos grupos do usuário",
                        example: ["64f8a9b123456789abcdef02"]
                    }
                },
                required: ["_id", "nome", "email", "ativo"]
            },
            accesstoken: { 
                type: "string", 
                description: "Token de acesso JWT",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access_token_payload.signature"
            },
            refreshtoken: { 
                type: "string", 
                description: "Token de renovação JWT",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh_token_payload.signature"
            }
        },
        required: ["user", "accesstoken", "refreshtoken"],
        description: "Schema de resposta para login bem-sucedido"
    },

    SignupResponse: {
        type: "object",
        properties: {
            _id: { 
                type: "string", 
                description: "ID único do usuário criado",
                example: "64f8a9b123456789abcdef01"
            },
            nome: { 
                type: "string", 
                description: "Nome do usuário",
                example: "João Silva"
            },
            email: { 
                type: "string", 
                format: "email",
                description: "Email do usuário",
                example: "joao@email.com"
            },
            ativo: { 
                type: "boolean", 
                description: "Status de ativação do usuário",
                example: false
            },
            createdAt: { 
                type: "string", 
                format: "date-time",
                description: "Data de criação do usuário",
                example: "2025-01-15T10:30:00.000Z"
            }
        },
        required: ["_id", "nome", "email", "ativo", "createdAt"],
        description: "Schema de resposta para cadastro bem-sucedido"
    },

    RefreshTokenResponse: {
        type: "object",
        properties: {
            accesstoken: { 
                type: "string", 
                description: "Novo token de acesso JWT",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_access_token_payload.signature"
            },
            refreshtoken: { 
                type: "string", 
                description: "Novo token de renovação JWT",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_refresh_token_payload.signature"
            }
        },
        required: ["accesstoken", "refreshtoken"],
        description: "Schema de resposta para renovação de token"
    },

    IntrospectResponse: {
        type: "object",
        properties: {
            valid: { 
                type: "boolean", 
                description: "Se o token é válido",
                example: true
            },
            user: {
                type: "object",
                properties: {
                    _id: { 
                        type: "string", 
                        description: "ID único do usuário",
                        example: "64f8a9b123456789abcdef01"
                    },
                    nome: { 
                        type: "string", 
                        description: "Nome do usuário",
                        example: "Administrador"
                    },
                    email: { 
                        type: "string", 
                        format: "email",
                        description: "Email do usuário",
                        example: "admin@gmail.com"
                    }
                }
            },
            exp: { 
                type: "number", 
                description: "Timestamp de expiração do token",
                example: 1640995200
            }
        },
        required: ["valid"],
        description: "Schema de resposta para validação de token"
    },

    AuthError: {
        type: "object",
        properties: {
            data: {
                type: "array",
                items: {},
                example: []
            },
            message: { 
                type: "string", 
                description: "Mensagem de erro",
                example: "Credenciais inválidas"
            },
            errors: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        message: { 
                            type: "string",
                            example: "Email ou senha incorretos"
                        }
                    }
                },
                example: [{ message: "Email ou senha incorretos" }]
            }
        },
        required: ["data", "message", "errors"],
        description: "Schema para erros de autenticação"
    }
};

export default authSchemas;
