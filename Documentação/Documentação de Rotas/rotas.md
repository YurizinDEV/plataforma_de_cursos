# Documentação de Rotas - Plataforma de Cursos

## 1. Autenticação

### 1.1 POST /login

#### Caso de Uso
- Realizar autenticação de usuário no sistema, permitindo o acesso às funcionalidades internas.

#### Regras de Negócio Envolvidas
- **Validação de Credenciais**: Verifica se o e-mail e a senha correspondem a um usuário cadastrado e ativo no banco de dados.
- **Emissão de Token**: Gera um token de acesso (access token) e um de atualização (refresh token) em caso de sucesso na autenticação. Se um refresh token válido já existir, ele é reutilizado; caso contrário, um novo é gerado.

#### Resultado Esperado
- **200 OK**: Geração de tokens de autenticação para acesso ao sistema e retorno do objeto de usuário com os tokens gerados.
- **401 Unauthorized**: Em caso de falha na autenticação (e-mail não encontrado ou senha incorreta), retorna uma mensagem de erro específica.

### 1.2 POST /recover

#### Caso de Uso
- Inicia o processo de recuperação de senha para um usuário que esqueceu suas credenciais, através do e-mail cadastrado.

#### Regras de Negócio Envolvidas
- **Validação de E-mail**: Verifica se o e-mail fornecido existe na base de dados.
- **Geração de Código/Token**: Cria um código de recuperação e um token único e temporário para a redefinição de senha.
- **Envio de E-mail**: Dispara um e-mail para o usuário contendo as instruções e o link para a recuperação.

#### Resultado Esperado
- **200 OK**: Envio bem-sucedido das instruções de recuperação e retorno de uma mensagem de confirmação da solicitação.
- **404 Not Found**: Em caso de e-mail não encontrado.

### 1.3 POST /signup

#### Caso de Uso
- Realiza o cadastro de um novo usuário com senha no sistema.

#### Regras de Negócio Envolvidas
- **Validação de Dados**: Verifica se todos os campos obrigatórios (nome, e-mail, senha) foram preenchidos, conforme o `UsuarioSchema`.
- **Unicidade de E-mail**: Garante que o e-mail não está em uso por outro usuário.
- **Criptografia de Senha**: Aplica hash na senha antes do armazenamento.
- **Regras de Senha**: Valida a complexidade da senha (mínimo de 8 caracteres, com letras maiúsculas, minúsculas, números e caracteres especiais).

#### Resultado Esperado
- **201 Created**: Usuário criado com sucesso. O corpo da resposta contém os dados do usuário (sem a senha).
- **400 Bad Request**: Em caso de dados inválidos, como um e-mail em formato incorreto ou uma senha que não atende aos critérios de complexidade.
- **409 Conflict**: Em caso de e-mail duplicado, o `errorHandler` retorna um erro de conflito.

### 1.4 POST /logout

#### Caso de Uso
- Realiza o logout do usuário, invalidando sua sessão ativa ao remover seus tokens.

#### Regras de Negócio Envolvidas
- **Invalidação de Token**: Remove o `accesstoken` e o `refreshtoken` do registro do usuário no banco de dados.
- **Validação de Token de Acesso**: O `AuthMiddleware` valida o token de acesso enviado no header da requisição.

#### Resultado Esperado
- **200 OK**: Logout realizado com sucesso, com retorno de uma mensagem de confirmação.
- **401 Unauthorized**: Se o token de acesso for inválido ou expirado.

### 1.5 POST /revoke

#### Caso de Uso
- Revoga os tokens de acesso de um usuário, impedindo seu uso futuro.

#### Regras de Negócio Envolvidas
- **Invalidação de Token**: Semelhante ao logout, remove os tokens do usuário do banco de dados, invalidando a sessão a partir do ID do usuário informado no corpo da requisição.

#### Resultado Esperado
- **200 OK**: Tokens revogados com sucesso, com retorno de uma mensagem de confirmação.

### 1.6 POST /refresh

#### Caso de Uso
- Gera um novo token de acesso utilizando um refresh token válido.

#### Regras de Negócio Envolvidas
- **Validação de Refresh Token**: Verifica se o refresh token fornecido no corpo ou no header da requisição é válido e não expirou.
- **Geração de Novo Token**: Cria um novo token de acesso com validade renovada.

#### Resultado Esperado
- **200 OK**: Novo token de acesso gerado com sucesso, retornando o novo `accesstoken` e o `refreshtoken`.
- **400 Bad Request**: Se o refresh token não for informado.
- **401 Unauthorized**: Em caso de refresh token inválido ou expirado.

### 1.7 POST /introspect

#### Caso de Uso
- Verifica a validade e obtém informações detalhadas de um token de acesso.

#### Regras de Negócio Envolvidas
- **Validação de Token**: Verifica a assinatura e a data de expiração do token de acesso fornecido no corpo da requisição.

#### Resultado Esperado
- **200 OK**: Retorna um objeto com o status do token (`active: true` ou `false`) e informações como `client_id`, `exp`, `iat`.
- **401 Unauthorized**: Em caso de token inválido ou expirado.

## 2. Usuário

### 2.1 POST /usuarios

#### Caso de Uso
- Criar um novo usuário.

#### Regras de Negócio
- **Validação de Schema**: Os dados do corpo da requisição são validados contra o `UsuarioSchema`, que exige nome, e-mail e senha com complexidade específica.
- **Unicidade de E-mail**: O serviço verifica se o e-mail já está em uso.
- **Criptografia de Senha**: A senha é criptografada usando `bcrypt` antes de ser salva.
- **Status Padrão**: O campo `ativo` é definido como `false` por padrão.
- **Autorização**: A rota é protegida e requer permissão de acesso.

#### Resultado Esperado
- **201 Created**: Usuário criado com sucesso. O corpo da resposta contém os dados do usuário, exceto o campo `senha`.
- **400 Bad Request**: Se os dados de entrada forem inválidos.
- **409 Conflict**: Se o e-mail já estiver em uso.
- **401 Unauthorized / 403 Forbidden**: Se o usuário não estiver autenticado ou não tiver permissão.

### 2.2 GET /usuarios e GET /usuarios/:id

#### Caso de Uso
- Listar usuários com filtros e paginação ou obter um usuário específico por ID.

#### Regras de Negócio
- **Validação de Parâmetros**: Valida o ID do usuário e os parâmetros de query conforme os schemas `UsuarioIdSchema` e `UsuarioQuerySchema`.
- **Enriquecimento de Dados**: O repositório enriquece os dados do usuário com estatísticas de progresso, como total de cursos, cursos concluídos e em andamento.
- **Segurança**: O campo `senha` nunca é retornado na resposta.
- **Autorização**: Requer autenticação e permissão.

#### Resultado Esperado
- **200 OK**: Retorna uma lista paginada de usuários ou um único usuário com dados enriquecidos.
- **404 Not Found**: Se um ID de usuário é fornecido e não é encontrado no banco de dados.
- **400 Bad Request**: Se os parâmetros de query ou o ID forem inválidos.

### 2.3 PUT/PATCH /usuarios/:id

#### Caso de Uso
- Atualizar informações de um usuário existente, como nome e status de ativação.

#### Regras de Negócio
- **Validação**: Valida o ID e os dados do corpo da requisição com `UsuarioIdSchema` e `UsuarioUpdateSchema`.
- **Campos Protegidos**: Os campos `email` e `senha` são explicitamente removidos da requisição de atualização para impedir alterações diretas.
- **Autorização**: Requer autenticação e permissão.

#### Resultado Esperado
- **200 OK**: Usuário atualizado com sucesso. Retorna os dados atualizados (sem a senha) e uma mensagem informativa.
- **404 Not Found**: Se o usuário com o ID fornecido não for encontrado.
- **400 Bad Request**: Se os dados de atualização forem inválidos.

### 2.4 DELETE /usuarios/:id

#### Caso de Uso
- Desativa um usuário (soft delete).

#### Regras de Negócio
- **Soft Delete**: Altera o campo `ativo` do usuário para `false`.
- **Autorização**: Requer autenticação e permissão.

#### Resultado Esperado
- **200 OK**: Usuário desativado com sucesso, retornando os dados do usuário com o status `ativo: false`.
- **404 Not Found**: Se o usuário com o ID fornecido não for encontrado.

### 2.5 PATCH /usuarios/:id/restaurar

#### Caso de Uso
- Restaura um usuário que foi desativado (soft delete).

#### Regras de Negócio
- **Reativação**: Altera o campo `ativo` do usuário para `true`.
- **Autorização**: Requer autenticação e permissão.

#### Resultado Esperado
- **200 OK**: Usuário restaurado com sucesso, retornando os dados do usuário com o status `ativo: true`.
- **404 Not Found**: Se o usuário com o ID fornecido não for encontrado.

### 2.6 DELETE /usuarios/:id/permanente

#### Caso de Uso
- Remove permanentemente um usuário e suas dependências do sistema.

#### Regras de Negócio
- **Verificação de Dependências**: O serviço impede a exclusão se o usuário for autor de cursos ou tiver progresso significativo (≥ 50%) em algum curso.
- **Exclusão em Cascata**: Executa a exclusão do usuário e remove suas referências em outras coleções (certificados, cursos) dentro de uma transação para garantir a atomicidade.
- **Autorização**: Requer autenticação e permissão.

#### Resultado Esperado
- **200 OK**: Usuário removido permanentemente, com um resumo das exclusões realizadas.
- **404 Not Found**: Se o usuário não for encontrado.
- **409 Conflict**: Se houver dependências que impeçam a exclusão.

## 3. Cursos

### 3.1 POST /cursos

#### Caso de Uso
- Cria um novo curso na plataforma.

#### Regras de Negócio Envolvidas
- **Validação de Schema**: Os dados do corpo da requisição são validados pelo `CursoSchema`.
- **Validação de Criador**: O `CursoService` verifica se o `criadoPorId` corresponde a um usuário existente.
- **Validação de Título**: Garante que o título do curso seja único.
- **Autorização**: Requer autenticação e permissão.

#### Resultado Esperado
- **201 Created**: Curso criado com sucesso, retornando os dados do curso.
- **400 Bad Request**: Se os dados forem inválidos (ex: `criadoPorId` inexistente) ou o título já estiver em uso.
- **401 Unauthorized / 403 Forbidden**: Se o usuário não estiver autenticado ou não tiver permissão.

### 3.2 GET /cursos e GET /cursos/:id

#### Caso de Uso
- Lista todos os cursos com filtros e paginação ou obtém um curso específico pelo ID.

#### Regras de Negócio Envolvidas
- **Validação de Parâmetros**: Valida o `id` e os parâmetros de `query` conforme os schemas `CursoIdSchema` e `CursoQuerySchema`.
- **Enriquecimento de Dados**: O `CursoRepository` enriquece os dados do curso com estatísticas, como número total de aulas, questionários, alternativas, certificados e duração formatada.
- **Filtro Padrão**: Por padrão, lista apenas cursos com status "ativo" se nenhum outro status for especificado.
- **Autorização**: Requer autenticação e permissão.

#### Resultado Esperado
- **200 OK**: Retorna uma lista paginada de cursos ou um único curso com dados enriquecidos.
- **404 Not Found**: Se o curso com o ID especificado não for encontrado, retorna uma lista vazia (o `listar` do repositório foi projetado para não lançar erro nesse caso).

### 3.3 PUT/PATCH /cursos/:id

#### Caso de Uso
- Atualiza as informações de um curso existente.

#### Regras de Negócio Envolvidas
- **Validação**: Valida o ID e os dados do corpo com `CursoIdSchema` e `CursoUpdateSchema`.
- **Verificação de Existência**: Garante que o curso existe antes de tentar a atualização.
- **Validação de Título**: Se o título for alterado, verifica se o novo título já não está em uso por outro curso.
- **Validação de Corpo Vazio**: Impede requisições de atualização com corpo vazio ou sem campos válidos para atualizar.
- **Autorização**: Requer autenticação e permissão.

#### Resultado Esperado
- **200 OK**: Curso atualizado com sucesso, retornando os dados atualizados.
- **404 Not Found**: Se o curso não for encontrado.
- **400 Bad Request**: Se os dados de atualização forem inválidos ou se o corpo da requisição estiver vazio.

### 3.4 DELETE /cursos/:id

#### Caso de Uso
- Arquiva um curso (soft delete).

#### Regras de Negócio Envolvidas
- **Soft Delete**: Altera o status do curso para "arquivado".
- **Autorização**: Requer autenticação e permissão.

#### Resultado Esperado
- **200 OK**: Curso arquivado com sucesso, retornando os dados do curso com o novo status.
- **404 Not Found**: Se o curso não for encontrado.

### 3.5 PATCH /cursos/:id/restaurar

#### Caso de Uso
- Restaura um curso que foi arquivado.

#### Regras de Negócio Envolvidas
- **Reativação**: Altera o status do curso para "ativo".
- **Autorização**: Requer autenticação e permissão.

#### Resultado Esperado
- **200 OK**: Curso restaurado com sucesso, retornando os dados do curso com o status "ativo".
- **404 Not Found**: Se o curso não for encontrado.

### 3.6 DELETE /cursos/:id/permanente

#### Caso de Uso
- Remove permanentemente um curso e todas as suas dependências.

#### Regras de Negócio Envolvidas
- **Verificação de Dependências**: O serviço impede a exclusão se houver usuários com progresso significativo no curso.
- **Exclusão em Cascata**: Remove aulas, questionários, alternativas e certificados associados ao curso, além de remover as referências do curso nos registros de usuários, tudo dentro de uma transação atômica.
- **Autorização**: Requer autenticação e permissão.

#### Resultado Esperado
- **200 OK**: Curso e suas dependências removidos com sucesso. Retorna um objeto com estatísticas sobre os recursos excluídos.
- **404 Not Found**: Se o curso não for encontrado.
- **409 Conflict**: Se houver dependências que bloqueiam a exclusão.
- **500 Internal Server Error**: Se ocorrer um erro durante a transação de exclusão.

## 4. Aulas
### 4.1 POST /aulas
**Caso de Uso:**  
Adição de novas aulas a um curso existente.

**Regras de Negócio:**  
Acesso restrito a professores e administradores.  
URL de conteúdo obrigatória.  
Vinculação automática ao curso especificado.

**Resultado Esperado:**  
Aula criada e vinculada ao curso.

### 4.2 GET /aulas
**Caso de Uso:**  
Listar todas as aulas disponíveis.

**Regras de Negócio:**  
Acesso restrito a usuários autenticados.

**Resultado Esperado:**  
Lista de aulas registradas na plataforma.

### 4.3 GET /aulas/:id
**Caso de Uso:**  
Consulta a uma aula específica.

**Regras de Negócio:**  
A aula deve existir.

**Resultado Esperado:**  
Dados completos da aula solicitada.

### 4.4 PUT /aulas/:id
**Caso de Uso:**  
Substituição das informações de uma aula.

**Regras de Negócio:**  
Acesso restrito a professores e administradores.

**Resultado Esperado:**  
Confirmação da substituição das informações da aula.

### 4.5 PATCH /aulas/:id
**Caso de Uso:**  
Atualização das informações da aula.

**Regras de Negócio:**  
Acesso restrito a professores e administradores.

**Resultado Esperado:**  
Confirmação da atualização bem-sucedida.

### 4.6 DELETE /aulas/:id
**Caso de Uso:**  
Remoção de uma aula de um curso.

**Regras de Negócio:**  
Acesso restrito a professores e administradores.

**Resultado Esperado:**  
Confirmação da remoção da aula.

## 5. Questionários
### 5.1 GET /questionarios
**Caso de Uso:**  
Listar todos os questionários disponíveis.

**Regras de Negócio:**  
Acesso restrito a usuários autenticados.

**Resultado Esperado:**  
Lista de questionários no sistema.

### 5.2 GET /questionarios/:id
**Caso de Uso:**  
Consulta a um questionário específico.

**Regras de Negócio:**  
O questionário deve existir.

**Resultado Esperado:**  
Dados completos do questionário solicitado.

### 5.3 POST /questionarios
**Caso de Uso:**  
Criação de um novo questionário.

**Regras de Negócio:**  
Acesso restrito a administradores.

**Resultado Esperado:**  
Questionário criado com sucesso.

### 5.4 PUT /questionarios/:id
**Caso de Uso:**  
Substituição das informações de um questionário.

**Regras de Negócio:**  
Acesso restrito a administradores.

**Resultado Esperado:**  
Confirmação da substituição das informações do questionário.

### 5.5 PATCH /questionarios/:id
**Caso de Uso:**  
Atualização das informações do questionário.

**Regras de Negócio:**  
Acesso restrito a administradores.

**Resultado Esperado:**  
Confirmação da atualização bem-sucedida.

### 5.6 DELETE /questionarios/:id
**Caso de Uso:**  
Remoção de um questionário do sistema.

**Regras de Negócio:**  
Acesso restrito a administradores.

**Resultado Esperado:**  
Confirmação da remoção do questionário.

### 5.7 POST /questionarios/:questionarioId/alternativas/:alternativaId
**Caso de Uso:**  
Adicionar uma alternativa a um questionário.

**Regras de Negócio:**  
Acesso restrito a administradores.  
Alternativa deve existir.

**Resultado Esperado:**  
Confirmação da adição de alternativa ao questionário.

## 6. Certificados
### 6.1 GET /certificados
**Caso de Uso:**  
Listar todos os certificados emitidos.

**Regras de Negócio:**  
Acesso restrito a administradores.

**Resultado Esperado:**  
Lista de todos os certificados emitidos no sistema.

### 6.2 GET /certificados/:id
**Caso de Uso:**  
Consulta a um certificado específico.

**Regras de Negócio:**  
O certificado deve existir.

**Resultado Esperado:**  
Dados completos do certificado solicitado.

### 6.3 POST /certificados
**Caso de Uso:**  
Criação de um novo certificado.

**Regras de Negócio:**  
Acesso restrito a administradores.

**Resultado Esperado:**  
Certificado criado com sucesso.

### 6.4 POST /certificados/emitir/:usuarioId/:cursoId
**Caso de Uso:**  
Emitir um certificado para um usuário após a conclusão de um curso.

**Regras de Negócio:**  
O usuário deve estar matriculado no curso.

**Resultado Esperado:**  
Confirmação da emissão do certificado.

## 7. Alternativas
### 7.1 GET /alternativas
**Caso de Uso:**  
Listar todas as alternativas disponíveis.

**Regras de Negócio:**  
Acesso restrito a usuários autenticados.

**Resultado Esperado:**  
Lista de alternativas no sistema.

### 7.2 GET /alternativas/:id
**Caso de Uso:**  
Consulta a uma alternativa específica.

**Regras de Negócio:**  
A alternativa deve existir.

**Resultado Esperado:**  
Dados completos da alternativa solicitada.

### 7.3 POST /alternativas
**Caso de Uso:**  
Criação de uma nova alternativa.

**Regras de Negócio:**  
Acesso restrito a administradores.

**Resultado Esperado:**  
Alternativa criada com sucesso.

### 7.4 PUT /alternativas/:id
**Caso de Uso:**  
Substituição das informações de uma alternativa.

**Regras de Negócio:**  
Acesso restrito a administradores.

**Resultado Esperado:**  
Confirmação da substituição das informações da alternativa.

### 7.5 DELETE /alternativas/:id
**Caso de Uso:**  
Remoção de uma alternativa do sistema.

**Regras de Negócio:**  
Acesso restrito a administradores.

**Resultado Esperado:**  
Confirmação da remoção da alternativa.

## Regras Gerais
- **Autenticação:** Todas as rotas (exceto login) requerem token JWT válido.
- **Validação:** Campos marcados como required nos models são obrigatórios.

## Hierarquia
Cursos contêm aulas.  
Aulas podem ter questionários.  
Conclusão de cursos gera certificados.

## Fluxo Principal do Administrador

1. **Login**  
   O administrador faz login na plataforma:  
   **Método:** `POST /auth/login`  
   **Dados:** E-mail e senha do administrador.  
   **Resultado:** Token de autenticação válido e dados do administrador.

2. **Criar um Curso**  
   O administrador cria um novo curso:  
   **Método:** `POST /cursos`  
   **Dados:** Nome do curso, descrição e carga horária (opcional).  
   **Resultado:** Curso registrado no sistema com os dados do curso criado.

3. **Adicionar Aulas ao Curso**  
   O administrador adiciona novas aulas ao curso recém-criado:  
   **Método:** `POST /aulas`  
   **Dados:** Título da aula, descrição, URL de conteúdo e ID do curso ao qual a aula deve ser vinculada.  
   **Resultado:** Aula criada e vinculada ao curso.

4. **Acessar o Curso**  
   O administrador consulta as informações do curso criado:  
   **Método:** `GET /cursos/:id`  
   **Resultado:** Dados completos do curso, incluindo as aulas vinculadas.

### Resumo do Fluxo
Esse fluxo resume as etapas essenciais que um administrador deve seguir para gerenciar os cursos na plataforma.

## Fluxo Principal do Usuário

1. **Login**  
   O usuário faz login na plataforma:  
   **Método:** `POST /auth/login`  
   **Dados:** E-mail e senha do usuário.  
   **Resultado:** Token de autenticação válido e dados do usuário.

2. **Acessar Curso**  
   O usuário consulta as informações de um curso disponível:  
   **Método:** `GET /cursos/:id`  
   **Dados:** ID do curso desejado.  
   **Resultado:** Dados completos do curso, incluindo informações sobre aulas.

3. **Acesso às Aulas**  
   O usuário visualiza as aulas disponíveis em um curso:  
   **Método:** `GET /cursos/:id/aulas`  
   **Dados:** ID do curso.  
   **Resultado:** Lista de aulas disponíveis para o curso.

4. **Realizar Questionário**  
   O usuário responde ao questionário do curso:  
   **Método:** `POST /questionarios/:id/respostas`  
   **Dados:** Respostas fornecidas para o questionário.  
   **Resultado:** Confirmação do envio das respostas e registro do progresso.

5. **Obter Certificado**  
   O usuário recebe seu certificado após conclusão:  
   **Método:** `GET /usuarios/:id/certificados`  
   **Dados:** ID do usuário.  
   **Resultado:** Lista de certificados obtidos pelo usuário após a conclusão de cursos.

### Resumo do Fluxo
Esse fluxo resume as etapas essenciais que um usuário deve seguir para acessar cursos, realizar atividades e obter certificados na plataforma.