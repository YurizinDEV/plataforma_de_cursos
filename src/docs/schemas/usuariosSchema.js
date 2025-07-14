const usuariosSchemas = {
    UsuarioPost: {
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
                description: "Email único do usuário",
                example: "joao.silva@email.com"
            },
            senha: { 
                type: "string", 
                description: "Senha do usuário (mínimo 8 caracteres)",
                minLength: 8,
                example: "MinhaSenh@123"
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
        required: ["nome", "email", "senha"],
        description: "Schema para criação de usuário"
    },

    UsuarioPut: {
        type: "object",
        properties: {
            nome: { 
                type: "string", 
                description: "Nome completo do usuário",
                minLength: 3,
                example: "João Silva Santos"
            },
            email: { 
                type: "string", 
                format: "email",
                description: "Email único do usuário",
                example: "joao.santos@email.com"
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
        description: "Schema para atualização de usuário (todos os campos são opcionais)"
    },

    UsuarioDetalhes: {
        type: "object",
        properties: {
            _id: { 
                type: "string", 
                description: "ID único do usuário",
                example: "64f8a9b123456789abcdef01"
            },
            nome: { 
                type: "string", 
                description: "Nome completo do usuário",
                example: "João Silva"
            },
            email: { 
                type: "string", 
                format: "email",
                description: "Email do usuário",
                example: "joao.silva@email.com"
            },
            ativo: { 
                type: "boolean", 
                description: "Status de ativação do usuário",
                example: true
            },
            grupos: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        _id: { 
                            type: "string",
                            example: "64f8a9b123456789abcdef02"
                        },
                        nome: { 
                            type: "string",
                            example: "Administradores"
                        }
                    }
                },
                description: "Lista dos grupos do usuário",
                example: [
                    {
                        "_id": "64f8a9b123456789abcdef02",
                        "nome": "Administradores"
                    }
                ]
            },
            cursosIds: {
                type: "array",
                items: {
                    type: "string"
                },
                description: "Lista de IDs dos cursos do usuário",
                example: ["64f8a9b123456789abcdef03"]
            },
            progresso: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        percentual_conclusao: {
                            type: "string",
                            example: "75"
                        },
                        curso: {
                            type: "string",
                            example: "64f8a9b123456789abcdef03"
                        }
                    }
                },
                description: "Progresso do usuário nos cursos",
                example: [
                    {
                        "percentual_conclusao": "75",
                        "curso": "64f8a9b123456789abcdef03"
                    }
                ]
            },
            createdAt: { 
                type: "string", 
                format: "date-time",
                description: "Data de criação do usuário",
                example: "2025-01-15T10:30:00.000Z"
            },
            updatedAt: { 
                type: "string", 
                format: "date-time",
                description: "Data da última atualização",
                example: "2025-01-15T10:30:00.000Z"
            }
        },
        required: ["_id", "nome", "email", "ativo", "grupos", "cursosIds", "progresso", "createdAt", "updatedAt"],
        description: "Schema detalhado de usuário"
    },

    UsuarioResumo: {
        type: "object",
        properties: {
            _id: { 
                type: "string", 
                description: "ID único do usuário",
                example: "64f8a9b123456789abcdef01"
            },
            nome: { 
                type: "string", 
                description: "Nome completo do usuário",
                example: "João Silva"
            },
            email: { 
                type: "string", 
                format: "email",
                description: "Email do usuário",
                example: "joao.silva@email.com"
            },
            ativo: { 
                type: "boolean", 
                description: "Status de ativação do usuário",
                example: true
            },
            createdAt: { 
                type: "string", 
                format: "date-time",
                description: "Data de criação do usuário",
                example: "2025-01-15T10:30:00.000Z"
            }
        },
        required: ["_id", "nome", "email", "ativo", "createdAt"],
        description: "Schema resumido de usuário para listagens"
    },

    AlterarSenhaRequest: {
        type: "object",
        properties: {
            senhaAtual: { 
                type: "string", 
                description: "Senha atual do usuário",
                minLength: 8,
                example: "SenhaAtual@123"
            },
            novaSenha: { 
                type: "string", 
                description: "Nova senha do usuário (mínimo 8 caracteres)",
                minLength: 8,
                example: "NovaSenha@456"
            }
        },
        required: ["senhaAtual", "novaSenha"],
        description: "Schema para alteração de senha"
    }
};

export default usuariosSchemas;
