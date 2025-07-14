import usuariosSchemas from "../schemas/usuariosSchema.js";
import commonResponses from "../schemas/swaggerCommonResponses.js";

const usuariosPaths = {
    "/usuarios": {
        post: {
            tags: ["Usuários"],
            summary: "Cria um novo usuário",
            description: `
            + **Caso de uso**: Criação de novo usuário no sistema.
            
            + **Função de Negócio**:
                - Permitir inserir um novo usuário com todos os dados obrigatórios.
                - Recebe no corpo da requisição objeto conforme schema **UsuarioPost**.
                - Criptografa a senha antes do armazenamento.

            + **Regras de Negócio**:
                - Validação de campos obrigatórios (nome, email, senha).  
                - Verificação de unicidade para email.  
                - Definição de status inicial (ativo: false por padrão).  
                - Em caso de duplicidade ou erro de validação, retorna erro apropriado.

            + **Resultado Esperado**:
                - HTTP 201 Created com corpo conforme **UsuarioDetalhes**, contendo todos os dados do usuário criado.
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/UsuarioPost"
                        }
                    }
                }
            },
            responses: {
                201: commonResponses[201]("#/components/schemas/UsuarioDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                409: commonResponses[409]("null", "Email já está em uso"),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        
        get: {
            tags: ["Usuários"],
            summary: "Lista todos os usuários",
            description: `
            + **Caso de uso**: Listagem de usuários para gerenciamento e consulta.
            
            + **Função de Negócio**:
                - Retornar lista paginada de usuários cadastrados.
                - Permitir filtragem por status (ativo/inativo).
                - Fornecer informações resumidas para facilitar visualização.

            + **Regras de Negócio**:
                - Apenas usuários autenticados podem acessar.
                - Retorna lista de usuários conforme permissões do usuário logado.
                - Suporte a paginação via query parameters.

            + **Resultado Esperado**:
                - HTTP 200 OK com array de usuários conforme **UsuarioResumo**.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "page",
                    in: "query",
                    description: "Número da página (padrão: 1)",
                    required: false,
                    schema: {
                        type: "integer",
                        minimum: 1,
                        example: 1
                    }
                },
                {
                    name: "limite",
                    in: "query",
                    description: "Número de itens por página (padrão: 10, máximo: 100)",
                    required: false,
                    schema: {
                        type: "integer",
                        minimum: 1,
                        maximum: 100,
                        example: 10
                    }
                },
                {
                    name: "nome",
                    in: "query",
                    description: "Filtrar por nome (busca parcial)",
                    required: false,
                    schema: {
                        type: "string",
                        example: "João"
                    }
                },
                {
                    name: "email",
                    in: "query",
                    description: "Filtrar por email",
                    required: false,
                    schema: {
                        type: "string",
                        format: "email",
                        example: "joao@email.com"
                    }
                },
                {
                    name: "ativo",
                    in: "query",
                    description: "Filtrar por status de ativação",
                    required: false,
                    schema: {
                        type: "string",
                        enum: ["true", "false"],
                        example: "true"
                    }
                },
                {
                    name: "grupos",
                    in: "query",
                    description: "Filtrar por grupos (IDs separados por vírgula)",
                    required: false,
                    schema: {
                        type: "string",
                        example: "64f8a9b123456789abcdef01,64f8a9b123456789abcdef02"
                    }
                },
                {
                    name: "grupo",
                    in: "query",
                    description: "Filtrar por nome do grupo",
                    required: false,
                    schema: {
                        type: "string",
                        example: "Administradores"
                    }
                },
                {
                    name: "dataInicio",
                    in: "query",
                    description: "Data de início para filtro de criação (YYYY-MM-DD)",
                    required: false,
                    schema: {
                        type: "string",
                        format: "date",
                        example: "2024-01-01"
                    }
                },
                {
                    name: "dataFim",
                    in: "query",
                    description: "Data de fim para filtro de criação (YYYY-MM-DD)",
                    required: false,
                    schema: {
                        type: "string",
                        format: "date",
                        example: "2024-12-31"
                    }
                },
                {
                    name: "ordenarPor",
                    in: "query",
                    description: "Campo para ordenação",
                    required: false,
                    schema: {
                        type: "string",
                        enum: ["nome", "email", "createdAt", "updatedAt"],
                        example: "nome"
                    }
                },
                {
                    name: "direcao",
                    in: "query",
                    description: "Direção da ordenação",
                    required: false,
                    schema: {
                        type: "string",
                        enum: ["asc", "desc"],
                        example: "asc"
                    }
                }
            ],
            responses: {
                200: {
                    description: "Lista de usuários retornada com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    data: {
                                        type: "array",
                                        items: {
                                            $ref: "#/components/schemas/UsuarioResumo"
                                        }
                                    },
                                    message: {
                                        type: "string",
                                        example: "Usuários listados com sucesso"
                                    },
                                    errors: {
                                        type: "array",
                                        example: []
                                    }
                                }
                            }
                        }
                    }
                },
                401: commonResponses[401](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },

    "/usuarios/{id}": {
        get: {
            tags: ["Usuários"],
            summary: "Busca usuário por ID",
            description: `
            + **Caso de uso**: Consulta de usuário específico.
            
            + **Função de Negócio**:
                - Retornar dados completos de um usuário específico.
                - Permitir consulta detalhada para edição ou visualização.

            + **Regras de Negócio**:
                - ID deve ser um ObjectId válido.
                - Usuário deve existir no sistema.
                - Apenas usuários autenticados podem acessar.

            + **Resultado Esperado**:
                - HTTP 200 OK com dados completos do usuário.
                - HTTP 404 se usuário não for encontrado.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "ID único do usuário",
                    required: true,
                    schema: {
                        type: "string",
                        example: "64f8a9b123456789abcdef01"
                    }
                }
            ],
            responses: {
                200: commonResponses[200]("#/components/schemas/UsuarioDetalhes"),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },

        put: {
            tags: ["Usuários"],
            summary: "Atualiza usuário por ID",
            description: `
            + **Caso de uso**: Atualização de dados de usuário.
            
            + **Função de Negócio**:
                - Permitir edição de dados de usuário existente.
                - Atualizar informações como nome, status e grupos.
                - Validar dados antes da atualização.

            + **Regras de Negócio**:
                - ID deve ser um ObjectId válido.
                - Usuário deve existir no sistema.
                - Email deve ser único (se alterado).
                - Apenas campos fornecidos são atualizados.

            + **Resultado Esperado**:
                - HTTP 200 OK com dados atualizados do usuário.
                - HTTP 404 se usuário não for encontrado.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "ID único do usuário",
                    required: true,
                    schema: {
                        type: "string",
                        example: "64f8a9b123456789abcdef01"
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/UsuarioPut"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/UsuarioDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                409: commonResponses[409]("null", "Email já está em uso"),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },

        delete: {
            tags: ["Usuários"],
            summary: "Remove usuário por ID",
            description: `
            + **Caso de uso**: Remoção de usuário do sistema.
            
            + **Função de Negócio**:
                - Permitir exclusão temporária de usuário.
                - Desativa um usuário (soft delete).

            + **Regras de Negócio**:
                - ID deve ser um ObjectId válido.
                - Usuário deve existir no sistema.
                - Exclusão é temporária e reversível.

            + **Resultado Esperado**:
                - HTTP 200 OK confirmando exclusão.
                - HTTP 404 se usuário não for encontrado.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "ID único do usuário",
                    required: true,
                    schema: {
                        type: "string",
                        example: "64f8a9b123456789abcdef01"
                    }
                }
            ],
            responses: {
                200: commonResponses[200]("null", "Usuário removido com sucesso"),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },
    "/usuarios/{id}/restaurar": {
        patch: {
            tags: ["Usuários"],
            summary: "Restaura usuário excluído",
            description: `
            + **Caso de uso**: Restauração de usuário que foi excluído do sistema (soft delete).
            
            + **Função de Negócio**:
                - Permitir reativação de usuário previamente excluído.
                - Reverter operação de exclusão lógica.
                - Restabelecer acesso e funcionalidades do usuário.

            + **Regras de Negócio**:
                - ID deve ser um ObjectId válido.
                - Usuário deve existir no sistema.
                - Usuário deve estar em estado de excluído (deletedAt preenchido).
                - Apenas usuários com permissão adequada podem restaurar.

            + **Resultado Esperado**:
                - HTTP 200 OK com dados do usuário restaurado.
                - HTTP 404 se usuário não for encontrado.
                - HTTP 400 se usuário não estiver excluído.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "ID único do usuário",
                    required: true,
                    schema: {
                        type: "string",
                        example: "64f8a9b123456789abcdef01"
                    }
                }
            ],
            responses: {
                200: commonResponses[200]("#/components/schemas/UsuarioDetalhes", "Usuário restaurado com sucesso"),
                400: commonResponses[400]("null", "Usuário não está excluído"),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },

    "/usuarios/{id}/permanente": {
        delete: {
            tags: ["Usuários"],
            summary: "Remove usuário permanentemente",
            description: `
            + **Caso de uso**: Exclusão permanente de usuário do sistema (hard delete).
            
            + **Função de Negócio**:
                - Permitir remoção definitiva e irreversível de usuário.
                - Excluir completamente todos os dados relacionados.
                - Operação de limpeza final do sistema.

            + **Regras de Negócio**:
                - ID deve ser um ObjectId válido.
                - Usuário deve existir no sistema.
                - Exclusão é permanente e irreversível.
                - Remove todas as referências e dados relacionados.
                - Apenas usuários com permissão adequada podem executar.

            + **Resultado Esperado**:
                - HTTP 200 OK confirmando exclusão permanente.
                - HTTP 404 se usuário não for encontrado.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "ID único do usuário",
                    required: true,
                    schema: {
                        type: "string",
                        example: "64f8a9b123456789abcdef01"
                    }
                }
            ],
            responses: {
                200: commonResponses[200]("null", "Usuário removido permanentemente"),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    }
};

export default usuariosPaths;
