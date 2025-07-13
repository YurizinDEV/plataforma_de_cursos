import cursosSchemas from "../schemas/cursosSchema.js";
import commonResponses from "../schemas/swaggerCommonResponses.js";

const cursosPaths = {
    "/cursos": {
        post: {
            tags: ["Cursos"],
            summary: "Cria um novo curso",
            description: `
            + **Caso de uso**: Criação de novo curso na plataforma.
            
            + **Função de Negócio**:
                - Permitir ao administrador criar um novo curso com todas as informações necessárias.
                - Recebe no corpo da requisição objeto conforme schema **CursoPost**.

            + **Regras de Negócio**:
                - Usuário deve ter permissão de administrador.
                - Validação de campos obrigatórios (título, descrição, etc.).
                - Verificação de unicidade para título do curso por criador.
                - Status inicial: não publicado (publicado: false).

            + **Resultado Esperado**:
                - HTTP 201 Created com corpo conforme **CursoDetalhes**, contendo todos os dados do curso criado.
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/CursoPost"
                        }
                    }
                }
            },
            responses: {
                201: commonResponses[201]("#/components/schemas/CursoDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403]("null", "Usuário não tem permissão de administrador"),
                409: commonResponses[409]("null", "Curso com este título já existe"),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        
        get: {
            tags: ["Cursos"],
            summary: "Lista todos os cursos",
            description: `
            + **Caso de uso**: Listagem de cursos disponíveis na plataforma.
            
            + **Função de Negócio**:
                - Retornar lista paginada de cursos publicados.
                - Permitir filtragem por título, descrição, etc.
                - Ordenação por diferentes critérios (data, título, duração).

            + **Regras de Negócio**:
                - Apenas cursos publicados são visíveis para usuários.
                - Administradores podem ver todos os cursos (publicados e não publicados).
                - Suporte a paginação e filtros via query parameters.

            + **Resultado Esperado**:
                - HTTP 200 OK com array de cursos conforme **CursoResumo**.
            `,
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
                    name: "limit",
                    in: "query",
                    description: "Número de itens por página (padrão: 10)",
                    required: false,
                    schema: {
                        type: "integer",
                        minimum: 1,
                        maximum: 50,
                        example: 10
                    }
                },
                {
                    name: "titulo",
                    in: "query",
                    description: "Filtrar por título (busca parcial)",
                    required: false,
                    schema: {
                        type: "string",
                        example: "JavaScript"
                    }
                },
                {
                    name: "tituloExato",
                    in: "query",
                    description: "Filtrar por título exato",
                    required: false,
                    schema: {
                        type: "string",
                        example: "Curso Completo de JavaScript"
                    }
                },
                {
                    name: "descricao",
                    in: "query",
                    description: "Filtrar por descrição (busca parcial)",
                    required: false,
                    schema: {
                        type: "string",
                        example: "programação"
                    }
                },
                {
                    name: "buscaGeral",
                    in: "query",
                    description: "Busca geral em título e descrição",
                    required: false,
                    schema: {
                        type: "string",
                        example: "JavaScript"
                    }
                },
                {
                    name: "status",
                    in: "query",
                    description: "Filtrar por status do curso",
                    required: false,
                    schema: {
                        type: "string",
                        enum: ["ativo", "inativo", "rascunho", "arquivado"],
                        example: "ativo"
                    }
                },
                {
                    name: "cargaHorariaMin",
                    in: "query",
                    description: "Carga horária mínima em horas",
                    required: false,
                    schema: {
                        type: "number",
                        minimum: 0,
                        example: 20
                    }
                },
                {
                    name: "cargaHorariaMax",
                    in: "query",
                    description: "Carga horária máxima em horas",
                    required: false,
                    schema: {
                        type: "number",
                        minimum: 0,
                        example: 100
                    }
                },
                {
                    name: "criadoPorId",
                    in: "query",
                    description: "ID do criador do curso",
                    required: false,
                    schema: {
                        type: "string",
                        example: "64f8a9b123456789abcdef01"
                    }
                },
                {
                    name: "temMaterialComplementar",
                    in: "query",
                    description: "Filtrar cursos com material complementar",
                    required: false,
                    schema: {
                        type: "boolean",
                        example: true
                    }
                },
                {
                    name: "temThumbnail",
                    in: "query",
                    description: "Filtrar cursos com thumbnail",
                    required: false,
                    schema: {
                        type: "boolean",
                        example: true
                    }
                },
                {
                    name: "quantidadeAulasMin",
                    in: "query",
                    description: "Quantidade mínima de aulas",
                    required: false,
                    schema: {
                        type: "number",
                        minimum: 0,
                        example: 5
                    }
                },
                {
                    name: "quantidadeAulasMax",
                    in: "query",
                    description: "Quantidade máxima de aulas",
                    required: false,
                    schema: {
                        type: "number",
                        minimum: 0,
                        example: 50
                    }
                },
                {
                    name: "ordenarPor",
                    in: "query",
                    description: "Campo para ordenação",
                    required: false,
                    schema: {
                        type: "string",
                        enum: ["titulo", "createdAt", "updatedAt", "cargaHorariaTotal", "status"],
                        example: "createdAt"
                    }
                },
                {
                    name: "direcaoOrdem",
                    in: "query",
                    description: "Direção da ordenação",
                    required: false,
                    schema: {
                        type: "string",
                        enum: ["asc", "desc"],
                        example: "desc"
                    }
                }
            ],
            responses: {
                200: {
                    description: "Lista de cursos retornada com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    data: {
                                        type: "array",
                                        items: {
                                            $ref: "#/components/schemas/CursoResumo"
                                        }
                                    },
                                    message: {
                                        type: "string",
                                        example: "Cursos listados com sucesso"
                                    },
                                    errors: {
                                        type: "array",
                                        example: []
                                    },
                                    pagination: {
                                        type: "object",
                                        properties: {
                                            currentPage: { type: "integer", example: 1 },
                                            totalPages: { type: "integer", example: 5 },
                                            totalItems: { type: "integer", example: 45 },
                                            itemsPerPage: { type: "integer", example: 10 }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                500: commonResponses[500]()
            }
        }
    },

    "/cursos/{id}": {
        get: {
            tags: ["Cursos"],
            summary: "Busca curso por ID",
            description: `
            + **Caso de uso**: Consulta de curso específico.
            
            + **Função de Negócio**:
                - Retornar dados completos de um curso específico.
                - Incluir informações de aulas e demais estatísticas.

            + **Regras de Negócio**:
                - ID deve ser um ObjectId válido.
                - Curso deve existir.

            + **Resultado Esperado**:
                - HTTP 200 OK com dados completos do curso.
                - HTTP 404 se curso não for encontrado.
            `,
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "ID único do curso",
                    required: true,
                    schema: {
                        type: "string",
                        example: "64f8a9b123456789abcdef01"
                    }
                }
            ],
            responses: {
                200: commonResponses[200]("#/components/schemas/CursoDetalhes"),
                404: commonResponses[404](),
                500: commonResponses[500]()
            }
        },

        put: {
            tags: ["Cursos"],
            summary: "Atualiza curso por ID",
            description: `
            + **Caso de uso**: Atualização de dados de curso.
            
            + **Função de Negócio**:
                - Permitir ao administrador editar dados de curso.
                - Atualizar informações como título, descrição, etc.

            + **Regras de Negócio**:
                - ID deve ser um ObjectId válido.
                - Curso deve existir no sistema.
                - Apenas campos fornecidos são atualizados.

            + **Resultado Esperado**:
                - HTTP 200 OK com dados atualizados do curso.
                - HTTP 404 se curso não for encontrado.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "ID único do curso",
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
                            $ref: "#/components/schemas/CursoPut"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/CursoDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },

        delete: {
            tags: ["Cursos"],
            summary: "Remove curso por ID",
            description: `
            + **Caso de uso**: Remoção reversível de curso da plataforma.
            
            + **Função de Negócio**:
                - Permitir ao administrador excluir curso.

            + **Regras de Negócio**:
                - Curso não pode ser excluído se houver alunos com progresso significativo.
                - Exclusão é temporária e reversível.

            + **Resultado Esperado**:
                - HTTP 200 OK confirmando exclusão.
                - HTTP 409 se houver alunos com progresso significativo.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "ID único do curso",
                    required: true,
                    schema: {
                        type: "string",
                        example: "64f8a9b123456789abcdef01"
                    }
                }
            ],
            responses: {
                200: commonResponses[200]("null", "Curso removido com sucesso"),
                401: commonResponses[401](),
                404: commonResponses[404](),
                409: commonResponses[409]("null", "Não é possível excluir curso com alunos matriculados"),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },

    "/cursos/{id}/restaurar": {
        patch: {
            tags: ["Cursos"],
            summary: "Restaura curso excluído",
            description: `
            + **Caso de uso**: Restauração de curso que foi excluído do sistema (soft delete).
            
            + **Função de Negócio**:
                - Permitir reativação de curso previamente excluído.
                - Reverter operação de exclusão lógica.
                - Restabelecer disponibilidade do curso na plataforma.

            + **Regras de Negócio**:
                - ID deve ser um ObjectId válido.
                - Curso deve existir no sistema.
                - Curso deve estar em estado de excluído (deletedAt preenchido).
                - Apenas usuários com permissão adequada podem restaurar.

            + **Resultado Esperado**:
                - HTTP 200 OK com dados do curso restaurado.
                - HTTP 404 se curso não for encontrado.
                - HTTP 400 se curso não estiver excluído.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "ID único do curso",
                    required: true,
                    schema: {
                        type: "string",
                        example: "64f8a9b123456789abcdef01"
                    }
                }
            ],
            responses: {
                200: commonResponses[200]("#/components/schemas/CursoDetalhes", "Curso restaurado com sucesso"),
                400: commonResponses[400]("null", "Curso não está excluído"),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },

    "/cursos/{id}/permanente": {
        delete: {
            tags: ["Cursos"],
            summary: "Remove curso permanentemente",
            description: `
            + **Caso de uso**: Exclusão permanente de curso do sistema (hard delete).
            
            + **Função de Negócio**:
                - Permitir remoção definitiva e irreversível de curso.
                - Excluir completamente todos os dados relacionados.
                - Operação de limpeza final do sistema.

            + **Regras de Negócio**:
                - ID deve ser um ObjectId válido.
                - Curso deve existir no sistema.
                - Exclusão é permanente e irreversível.
                - Remove todas as referências e dados relacionados.
                - Apenas usuários com permissão adequada podem executar.

            + **Resultado Esperado**:
                - HTTP 200 OK confirmando exclusão permanente.
                - HTTP 404 se curso não for encontrado.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "ID único do curso",
                    required: true,
                    schema: {
                        type: "string",
                        example: "64f8a9b123456789abcdef01"
                    }
                }
            ],
            responses: {
                200: commonResponses[200]("null", "Curso removido permanentemente"),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    }
};

export default cursosPaths;
