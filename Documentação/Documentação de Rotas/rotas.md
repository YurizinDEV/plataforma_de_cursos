# Documentação de Rotas - Plataforma de Cursos

## 1. Autenticação
### 1.1 POST /auth/login
**Caso de Uso:**  
Permite que usuários autentiquem no sistema para acessar funcionalidades restritas.

**Regras de Negócio:**  
Validação de e-mail e senha.  
Geração de token JWT para sessão.  
Restrição de acesso para contas não verificadas.

**Resultado Esperado:**  
Token de autenticação válido.  
Dados básicos do usuário logado.

## 2. Usuários
### 2.1 POST /usuarios
**Caso de Uso:**  
Cadastro de novos usuários na plataforma.

**Regras de Negócio:**  
E-mail único e válido.  
Senha criptografada antes do armazenamento.  
Primeiros 2 usuários cadastrados viram administradores automaticamente.

**Resultado Esperado:**  
Conta de usuário criada com sucesso.  
Retorno dos dados cadastrados (exceto senha).

### 2.2 GET /usuarios
**Caso de Uso:**  
Listar todos os usuários cadastrados.

**Regras de Negócio:**  
Acesso restrito a administradores.

**Resultado Esperado:**  
Lista de usuários registrados na plataforma.

### 2.3 GET /usuarios/:id
**Caso de Uso:**  
Consulta ao perfil de um usuário específico.

**Regras de Negócio:**  
Apenas o próprio usuário ou administradores podem acessar.  
Apenas administradores podem remover ou tornar um usuário administrador.  
Exibe progresso nos cursos matriculados por um usuário para os administradores.  
Exibe progresso nos cursos matriculados para o usuário.

**Resultado Esperado:**  
Dados completos do perfil solicitado.

### 2.4 PATCH /usuarios/:id
**Caso de Uso:**  
Atualização de informações do usuário.

**Regras de Negócio:**  
Acesso restrito ao usuário ou administradores.

**Resultado Esperado:**  
Confirmação da atualização bem-sucedida.

### 2.5 PUT /usuarios/:id
**Caso de Uso:**  
Substituição das informações do usuário.

**Regras de Negócio:**  
Acesso restrito ao usuário ou administradores.

**Resultado Esperado:**  
Confirmação da substituição das informações.

### 2.6 DELETE /usuarios/:id
**Caso de Uso:**  
Remoção de um usuário da plataforma.

**Regras de Negócio:**  
Acesso restrito a administradores.

**Resultado Esperado:**  
Confirmação da remoção do usuário.

## 3. Cursos
### 3.1 POST /cursos
**Caso de Uso:**  
Criação de novos cursos na plataforma.

**Regras de Negócio:**  
Acesso restrito a administradores.  
Apenas usuários administradores podem cadastrar, atualizar, remover e incluir conteúdos extras aos cursos.  
O sistema deve validar tamanho e formato de arquivos enviados antes de permitir a inserção (tal como PDF e menor que 15MB).  
O sistema deve incorporar URL de vídeos "embeds" do YouTube.  
Carga horária opcional.  
Relacionamento obrigatório com usuário criador.

**Resultado Esperado:**  
Curso registrado no sistema.  
Retorno dos dados do curso criado.

### 3.2 GET /cursos
**Caso de Uso:**  
Listar todos os cursos disponíveis.

**Regras de Negócio:**  
Acesso restrito a usuários autenticados.

**Resultado Esperado:**  
Lista de cursos registrados na plataforma.

### 3.3 GET /cursos/:id
**Caso de Uso:**  
Consulta a um curso específico.

**Regras de Negócio:**  
O curso deve existir.

**Resultado Esperado:**  
Dados completos do curso solicitado.

### 3.4 PUT /cursos/:id
**Caso de Uso:**  
Substituição das informações de um curso.

**Regras de Negócio:**  
Acesso restrito a administradores.

**Resultado Esperado:**  
Confirmação da substituição das informações do curso.

### 3.5 PATCH /cursos/:id
**Caso de Uso:**  
Atualização das informações do curso.

**Regras de Negócio:**  
Acesso restrito a administradores.

**Resultado Esperado:**  
Confirmação da atualização bem-sucedida.

### 3.6 DELETE /cursos/:id
**Caso de Uso:**  
Remoção de um curso da plataforma.

**Regras de Negócio:**  
Acesso restrito a administradores.

**Resultado Esperado:**  
Confirmação da remoção do curso.

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