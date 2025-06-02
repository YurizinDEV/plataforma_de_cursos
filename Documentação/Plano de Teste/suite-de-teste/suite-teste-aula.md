## Plano de teste para Model (Sprint 4)

| Funcionalidade        | Comportamento Esperado                                                                 | Verificações                                      | Critérios de Aceite                                       |
| --------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------- |
| Cadastro de aula      | Uma aula deve conter `titulo`, `conteudoURL`, `cargaHoraria`, `cursoId`, `criadoPorId` | Tentar salvar aula sem campos obrigatórios        | Deve falhar com erro de validação (`required`)            |
| Carga horária válida  | A carga horária deve ser um número ≥ 1                                                 | Inserir aula com cargaHoraria < 1                 | Deve falhar com erro de validação (`min`)                 |
| Título com limite     | O campo `titulo` deve ter no máximo 100 caracteres                                     | Inserir título com mais de 100 caracteres         | Deve falhar com erro de validação (`maxlength`)           |
| Curso existente       | A `aula` deve referenciar um `cursoId` válido                                          | Informar curso inexistente                        | Deve falhar com erro `Curso não encontrado`               |
| Título único no curso | Não deve existir duas aulas com mesmo título no mesmo curso                            | Criar aula com título já existente no mesmo curso | Deve retornar erro `CONFLICT`                             |
| Campos opcionais      | Campos como `descricao`, `materialComplementar` devem ser opcionais                    | Salvar aula omitindo campos opcionais             | A aula deve ser salva com os campos obrigatórios          |
| Arrays opcionais      | `materialComplementar` pode ser omitido ou estar vazio                                 | Cadastrar aula sem informar array                 | Deve inicializar como array vazio ou `undefined` sem erro |

---

## Plano de teste para Controller (Sprint 5)

| Funcionalidade              | Comportamento Esperado                                                         | Verificações                             | Critérios de Aceite                                                           |
| --------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------- |
| Validação de schema         | Deve validar `titulo`, `conteudoURL`, `cargaHoraria`, `cursoId`, `criadoPorId` | Enviar dados inválidos                   | Deve retornar erro `400`                                                      |
| Aula não encontrada         | Deve retornar erro ao acessar, atualizar ou deletar aula inexistente           | Buscar/Atualizar/Deletar id inexistente  | Deve retornar erro `404`                                                      |
| Mensagens padronizadas      | Sucesso e erro devem retornar mensagens padronizadas                           | Realizar operações                       | Mensagens devem seguir o padrão definido (`UPDATE_SUCCESS`, `DELETE_SUCCESS`) |
| Dados inválidos no cadastro | Deve retornar erro ao cadastrar aula com dados inválidos                       | Enviar sem `titulo`, `conteudoURL`, etc. | Deve retornar erro `400`                                                      |
| Falha inesperada            | Erros não tratados devem retornar erro `500`                                   | Simular exceções no controller           | Deve retornar erro `500` com mensagem padrão                                  |
| Filtros inválidos           | Rejeitar filtros inválidos ao listar aulas                                     | Usar query inválida                      | Deve retornar erro `400`                                                      |
| Enriquecimento de listagem  | A resposta de listagem deve conter dados completos da aula                     | Listar aulas                             | Deve retornar array de aulas com todos os campos                              |
| Atualização sem dados       | Não deve atualizar aula se nenhum dado for enviado                             | Enviar body vazio                        | Deve retornar erro `400`                                                      |

---

## Plano de teste para Service (Sprint 5)

| Funcionalidade            | Comportamento Esperado                                      | Verificações                                   | Critérios de Aceite                     |
| ------------------------- | ----------------------------------------------------------- | ---------------------------------------------- | --------------------------------------- |
| Verificação de existência | Aula deve existir antes de atualizar ou deletar             | Atualizar ou deletar com ID inexistente        | Deve lançar erro `404`                  |
| Validação de curso        | Verificar se o curso existe antes de cadastrar aula         | Enviar `cursoId` inválido                      | Deve lançar erro `Curso não encontrado` |
| Título duplicado          | Verificar se já existe aula com mesmo título no mesmo curso | Cadastrar título repetido no curso             | Deve lançar erro `CONFLICT`             |
| Atualização parcial       | Deve permitir atualização parcial dos campos                | Atualizar apenas `descricao` ou `cargaHoraria` | Aula é atualizada corretamente          |
| Erro inesperado do repo   | Erro no repository deve ser tratado                         | Simular erro em qualquer operação              | Deve lançar erro e manter integridade   |

---

## Plano de teste para Repository (Sprint 5)

| Funcionalidade            | Comportamento Esperado                                                | Verificações                                 | Critérios de Aceite                                      |
| ------------------------- | --------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------- |
| Buscar por ID             | Retorna corretamente aula por ID                                      | Buscar aula existente por ID                 | Deve retornar objeto da aula                             |
| Buscar por título e curso | Verifica existência de aula por título no curso                       | Chamar `buscarPorTituloECursoId`             | Retorna aula se existir, `null` caso contrário           |
| Aplicar filtros           | Deve aplicar filtros: título, cursoId, criadorId, carga horária, etc. | Listar com filtros variados                  | Retorna lista conforme filtros                           |
| Paginação                 | Deve aceitar paginação com `limit` e `page`                           | Listar com paginação                         | Deve retornar resultados paginados (se configurado)      |
| Atualizar aula            | Deve atualizar uma aula existente                                     | Atualizar com `findByIdAndUpdate`            | Retorna aula com campos atualizados                      |
| Deletar aula              | Deve remover uma aula existente                                       | Chamar `findByIdAndDelete`                   | Aula é removida                                          |
| Erro em aula inexistente  | Lança erro se não encontrar aula                                      | Buscar, atualizar ou deletar com ID inválido | Deve lançar erro `404`                                   |
| Erro inesperado do banco  | Deve capturar e propagar exceções do Mongoose                         | Simular falha no banco                       | Deve lançar `CustomError` mantendo integridade dos dados |

# Plano de Teste ENDPOINT (Sprint 6)