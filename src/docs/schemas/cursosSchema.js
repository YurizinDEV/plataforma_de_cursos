const cursosSchemas = {
    CursoPost: {
        type: "object",
        properties: {
            titulo: {
                type: "string",
                description: "Título do curso",
                example: "JavaScript Avançado",
                minLength: 1,
                maxLength: 100
            },
            descricao: {
                type: "string",
                description: "Descrição detalhada do curso",
                example: "Curso completo de JavaScript avançado cobrindo conceitos modernos e práticas recomendadas"
            },
            thumbnail: {
                type: "string",
                description: "URL da thumbnail/imagem de capa do curso",
                example: "https://exemplo.com/thumbnail-curso.jpg",
                format: "uri",
                maxLength: 250
            },
            cargaHorariaTotal: {
                type: "number",
                description: "Carga horária total do curso em horas",
                example: 40,
                minimum: 0,
                default: 0
            },
            materialComplementar: {
                type: "array",
                description: "URLs de materiais complementares do curso",
                items: {
                    type: "string",
                    format: "uri"
                },
                example: ["https://exemplo.com/material1.pdf", "https://exemplo.com/material2.pdf"]
            },
            professores: {
                type: "array",
                description: "Lista de nomes dos professores do curso",
                items: {
                    type: "string",
                    minLength: 1
                },
                example: ["João Silva", "Maria Santos"]
            },
            tags: {
                type: "array",
                description: "Tags relacionadas ao curso",
                items: {
                    type: "string"
                },
                example: ["javascript", "programação", "web", "frontend"]
            },
            status: {
                type: "string",
                description: "Status do curso",
                enum: ["ativo", "inativo", "rascunho", "arquivado"],
                example: "ativo",
                default: "ativo"
            },
            criadoPorId: {
                type: "string",
                description: "ID do usuário criador do curso",
                example: "64f8a9b123456789abcdef01",
                pattern: "^[0-9a-fA-F]{24}$"
            }
        },
        required: ["titulo", "criadoPorId"],
        description: "Schema para criação de curso"
    },

    CursoPut: {
        type: "object",
        properties: {
            titulo: {
                type: "string",
                description: "Título do curso",
                example: "JavaScript Avançado - Atualizado",
                minLength: 1,
                maxLength: 100
            },
            descricao: {
                type: "string",
                description: "Descrição detalhada do curso",
                example: "Curso completo de JavaScript avançado com novos módulos"
            },
            thumbnail: {
                type: "string",
                description: "URL da thumbnail/imagem de capa do curso",
                example: "https://exemplo.com/nova-imagem-curso.jpg",
                format: "uri",
                maxLength: 250
            },
            cargaHorariaTotal: {
                type: "number",
                description: "Carga horária total do curso em horas",
                example: 60,
                minimum: 0,
                default: 0
            },
            materialComplementar: {
                type: "array",
                description: "URLs de materiais complementares do curso",
                items: {
                    type: "string",
                    format: "uri"
                },
                example: ["https://exemplo.com/material1.pdf", "https://exemplo.com/material2.pdf"]
            },
            professores: {
                type: "array",
                description: "Lista de nomes dos professores do curso",
                items: {
                    type: "string",
                    minLength: 1
                },
                example: ["João Silva", "Maria Santos", "Pedro Costa"]
            },
            tags: {
                type: "array",
                description: "Tags relacionadas ao curso",
                items: {
                    type: "string"
                },
                example: ["javascript", "programação", "web", "backend", "nodejs"]
            },
            status: {
                type: "string",
                description: "Status do curso",
                enum: ["ativo", "inativo", "rascunho", "arquivado"],
                example: "ativo"
            }
        },
        required: [],
        description: "Schema para atualização de curso. Todos os campos são opcionais."
    },

    CursoDetalhes: {
        type: "object",
        properties: {
            _id: {
                type: "string",
                description: "ID único do curso",
                example: "64f8a9b123456789abcdef01"
            },
            titulo: {
                type: "string",
                description: "Título do curso",
                example: "JavaScript Avançado"
            },
            descricao: {
                type: "string",
                description: "Descrição detalhada do curso",
                example: "Curso completo de JavaScript avançado cobrindo conceitos modernos e práticas recomendadas"
            },
            thumbnail: {
                type: "string",
                description: "URL da thumbnail/imagem de capa do curso",
                example: "https://exemplo.com/imagem-curso.jpg"
            },
            cargaHorariaTotal: {
                type: "number",
                description: "Carga horária total do curso em horas",
                example: 40
            },
            materialComplementar: {
                type: "array",
                description: "URLs de materiais complementares do curso",
                items: {
                    type: "string",
                    format: "uri"
                },
                example: ["https://exemplo.com/material1.pdf", "https://exemplo.com/material2.pdf"]
            },
            professores: {
                type: "array",
                description: "Lista de nomes dos professores do curso",
                items: {
                    type: "string"
                },
                example: ["João Silva", "Maria Santos"]
            },
            tags: {
                type: "array",
                description: "Tags relacionadas ao curso",
                items: {
                    type: "string"
                },
                example: ["javascript", "programação", "web", "frontend"]
            },
            status: {
                type: "string",
                description: "Status do curso",
                enum: ["ativo", "inativo", "rascunho", "arquivado"],
                example: "ativo"
            },
            criadoPorId: {
                type: "string",
                description: "ID do usuário criador do curso",
                example: "64f8a9b123456789abcdef01",
                pattern: "^[0-9a-fA-F]{24}$"
            },
            createdAt: {
                type: "string",
                format: "date-time",
                description: "Data de criação do curso",
                example: "2024-01-15T10:30:00.000Z"
            },
            updatedAt: {
                type: "string",
                format: "date-time",
                description: "Data da última atualização",
                example: "2024-01-20T14:20:00.000Z"
            },
            deletedAt: {
                type: "string",
                format: "date-time",
                description: "Data de exclusão lógica (null se não foi excluído)",
                example: null,
                nullable: true
            }
        },
        required: ["_id", "titulo", "criadoPorId", "status"],
        description: "Schema detalhado do curso com todas as informações"
    },

    CursoResumo: {
        type: "object",
        properties: {
            _id: {
                type: "string",
                description: "ID único do curso",
                example: "64f8a9b123456789abcdef01"
            },
            titulo: {
                type: "string",
                description: "Título do curso",
                example: "JavaScript Avançado"
            },
            descricao: {
                type: "string",
                description: "Descrição resumida do curso",
                example: "Curso de JavaScript avançado"
            },
            thumbnail: {
                type: "string",
                description: "URL da thumbnail/imagem de capa do curso",
                example: "https://exemplo.com/imagem-curso.jpg"
            },
            cargaHorariaTotal: {
                type: "number",
                description: "Carga horária total do curso em horas",
                example: 40
            },
            professores: {
                type: "array",
                description: "Lista de nomes dos professores do curso",
                items: {
                    type: "string"
                },
                example: ["João Silva"]
            },
            tags: {
                type: "array",
                description: "Tags relacionadas ao curso",
                items: {
                    type: "string"
                },
                example: ["javascript", "programação"]
            },
            status: {
                type: "string",
                description: "Status do curso",
                enum: ["ativo", "inativo", "rascunho", "arquivado"],
                example: "ativo"
            },
            createdAt: {
                type: "string",
                format: "date-time",
                description: "Data de criação do curso",
                example: "2024-01-15T10:30:00.000Z"
            }
        },
        required: ["_id", "titulo", "status"],
        description: "Schema resumido do curso para listagens"
    }
};

export default cursosSchemas;