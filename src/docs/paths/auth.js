import authSchemas from "../schemas/authSchema.js";
import commonResponses from "../schemas/swaggerCommonResponses.js";

const authPaths = {
    "/login": {
        post: {
            tags: ["Auth"],
            summary: "Realiza login do usuário",
            description: `
            + **Caso de uso**: Autenticação de usuário no sistema.
            
            + **Função de Negócio**:
                - Permitir que usuários cadastrados acessem o sistema.
                - Validar credenciais (email e senha).
                - Gerar token JWT para acesso às rotas protegidas.

            + **Regras de Negócio**:
                - Email deve existir no sistema.
                - Senha deve estar correta.
                - Usuário deve estar ativo.
                - Token gerado com tempo de expiração definido.

            + **Resultado Esperado**:
                - HTTP 200 OK com token JWT e dados do usuário.
                - HTTP 401 Unauthorized para credenciais inválidas.
            `,
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/LoginRequest"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/LoginResponse"),
                400: commonResponses[400](),
                401: commonResponses[401]("null", "Credenciais inválidas"),
                500: commonResponses[500]()
            }
        }
    },

    "/signup": {
        post: {
            tags: ["Auth"],
            summary: "Cadastra novo usuário",
            description: `
            + **Caso de uso**: Registro de novo usuário no sistema.
            
            + **Função de Negócio**:
                - Permitir criação de nova conta de usuário.
                - Validar dados de entrada.
                - Criptografar senha antes do armazenamento.

            + **Regras de Negócio**:
                - Email deve ser único no sistema.
                - Senha deve atender aos critérios de segurança.
                - Campos obrigatórios devem ser preenchidos.

            + **Resultado Esperado**:
                - HTTP 201 Created com dados do usuário criado.
                - HTTP 409 Conflict para email já existente.
            `,
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/SignupRequest"
                        }
                    }
                }
            },
            responses: {
                201: commonResponses[201]("#/components/schemas/UsuarioDetalhes"),
                400: commonResponses[400](),
                409: commonResponses[409]("null", "Email já está em uso"),
                500: commonResponses[500]()
            }
        }
    },

    "/recover": {
        post: {
            tags: ["Auth"],
            summary: "Solicita recuperação de senha",
            description: `
            + **Caso de uso**: Recuperação de senha esquecida.
            
            + **Função de Negócio**:
                - Permitir que usuário solicite redefinição de senha.
                - Enviar email com instruções de recuperação.
                - Gerar token temporário para redefinição.

            + **Regras de Negócio**:
                - Email deve existir no sistema.
                - Token de recuperação tem validade limitada.
                - Apenas um token ativo por usuário.

            + **Resultado Esperado**:
                - HTTP 200 OK confirmando envio do email.
                - HTTP 404 Not Found se email não existir.
            `,
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RecoverPasswordRequest"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("null", "Email de recuperação enviado"),
                400: commonResponses[400](),
                404: commonResponses[404]("null", "Email não encontrado"),
                500: commonResponses[500]()
            }
        }
    },

    "/reset-password": {
        post: {
            tags: ["Auth"],
            summary: "Redefine senha com token",
            description: `
            + **Caso de uso**: Redefinição de senha usando token de recuperação.
            
            + **Função de Negócio**:
                - Permitir redefinição de senha com token válido.
                - Validar token de recuperação.
                - Atualizar senha do usuário.

            + **Regras de Negócio**:
                - Token deve ser válido e não expirado.
                - Nova senha deve atender aos critérios de segurança.
                - Token é invalidado após uso.

            + **Resultado Esperado**:
                - HTTP 200 OK confirmando alteração da senha.
                - HTTP 401 Unauthorized para token inválido/expirado.
            `,
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/ResetPasswordRequest"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("null", "Senha redefinida com sucesso"),
                400: commonResponses[400](),
                401: commonResponses[401]("null", "Token inválido ou expirado"),
                500: commonResponses[500]()
            }
        }
    },

    "/reset-password-code": {
        post: {
            tags: ["Auth"],
            summary: "Redefine senha com código",
            description: `
            + **Caso de uso**: Redefinição de senha usando código de verificação.
            
            + **Função de Negócio**:
                - Permitir redefinição de senha com código de verificação.
                - Validar código enviado por email/SMS.
                - Atualizar senha do usuário.

            + **Regras de Negócio**:
                - Código deve ser válido e não expirado.
                - Nova senha deve atender aos critérios de segurança.
                - Código é invalidado após uso.

            + **Resultado Esperado**:
                - HTTP 200 OK confirmando alteração da senha.
                - HTTP 401 Unauthorized para código inválido/expirado.
            `,
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/ResetPasswordCodeRequest"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("null", "Senha redefinida com sucesso"),
                400: commonResponses[400](),
                401: commonResponses[401]("null", "Código inválido ou expirado"),
                500: commonResponses[500]()
            }
        }
    },

    "/logout": {
        post: {
            tags: ["Auth"],
            summary: "Realiza logout do usuário",
            description: `
            + **Caso de uso**: Encerramento de sessão do usuário.
            
            + **Função de Negócio**:
                - Invalidar token de acesso atual.
                - Registrar evento de logout.
                - Limpar sessão do usuário.

            + **Regras de Negócio**:
                - Token deve estar válido.
                - Token é adicionado à blacklist.
                - Sessão é encerrada imediatamente.

            + **Resultado Esperado**:
                - HTTP 200 OK confirmando logout.
            `,
            security: [{ bearerAuth: [] }],
            responses: {
                200: commonResponses[200]("null", "Logout realizado com sucesso"),
                401: commonResponses[401](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },

    "/revoke": {
        post: {
            tags: ["Auth"],
            summary: "Revoga token de acesso",
            description: `
            + **Caso de uso**: Revogação manual de token.
            
            + **Função de Negócio**:
                - Permitir revogação de token específico.
                - Invalidar token de forma permanente.
                - Útil para logout forçado ou segurança.

            + **Regras de Negócio**:
                - Token deve estar válido.
                - Token é permanentemente invalidado.
                - Operação irreversível.

            + **Resultado Esperado**:
                - HTTP 200 OK confirmando revogação.
            `,
            security: [{ bearerAuth: [] }],
            responses: {
                200: commonResponses[200]("null", "Token revogado com sucesso"),
                401: commonResponses[401](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },

    "/refresh": {
        post: {
            tags: ["Auth"],
            summary: "Renova token de acesso",
            description: `
            + **Caso de uso**: Renovação de token próximo ao vencimento.
            
            + **Função de Negócio**:
                - Gerar novo token com validade estendida.
                - Manter sessão ativa sem re-autenticação.
                - Invalidar token anterior.

            + **Regras de Negócio**:
                - Token atual deve estar válido.
                - Novo token gerado com nova validade.
                - Token anterior é invalidado.

            + **Resultado Esperado**:
                - HTTP 200 OK com novo token.
            `,
            security: [{ bearerAuth: [] }],
            responses: {
                200: commonResponses[200]("#/components/schemas/RefreshTokenResponse"),
                401: commonResponses[401](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },

    "/introspect": {
        post: {
            tags: ["Auth"],
            summary: "Valida token de acesso",
            description: `
            + **Caso de uso**: Validação de token para verificação de autenticação.
            
            + **Função de Negócio**:
                - Verificar se token está válido e ativo.
                - Retornar informações do token.
                - Útil para validação em microsserviços.

            + **Regras de Negócio**:
                - Token deve estar no formato válido.
                - Verificar se não está na blacklist.
                - Validar assinatura e expiração.

            + **Resultado Esperado**:
                - HTTP 200 OK com informações do token.
                - HTTP 401 Unauthorized para token inválido.
            `,
            security: [{ bearerAuth: [] }],
            responses: {
                200: commonResponses[200]("#/components/schemas/IntrospectResponse"),
                401: commonResponses[401](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    }
};

export default authPaths;