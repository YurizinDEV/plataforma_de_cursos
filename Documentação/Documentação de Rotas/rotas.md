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

### 2.2 GET /usuarios/:id
**Caso de Uso:**

Consulta ao perfil de um usuário específico.

**Regras de Negócio:**

Apenas o próprio usuário ou administradores podem acessar.

Apenas administradores podem remover ou tornar um usuário administrador.

Exibe progresso nos cursos matriculados por um usuário para os administradores.

Exibe progresso nos cursos matriculados para o usuário.

**Resultado Esperado:**

Dados completos do perfil solicitado.

## 3. Cursos
### 3.1 POST /cursos
**Caso de Uso:**

Criação de novos cursos na plataforma.

**Regras de Negócio:**

Acesso restrito a administradores.

Apenas usuários administradores podem cadastrar, atualizar, remover e incluir conteúdos extras aos cursos.

O sistema deve validar tamanho e formato de arquivos enviados antes de permitir a inserção (tal como PDF e menor que 15MB).

O sistema deve incorporar url de vídeos "embeds" do youtube.

Carga horária opcional.

Relacionamento obrigatório com usuário criador.

Resultado Esperado:

Curso registrado no sistema.

Retorno dos dados do curso criado.

### 3.2 GET /cursos/:id/aulas
**Caso de Uso:**

Listagem das aulas vinculadas a um curso.

**Regras de Negócio:**

Curso deve existir.

Ordenação por data de criação.

Resultado Esperado:

Lista completa de aulas do curso especificado.

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

## 5. Questionários
### 5.1 GET /aulas/:id/questionarios
**Caso de Uso:**

Recuperação do questionário associado a uma aula.

**Regras de Negócio:**

Aula deve existir.

Questionário pode ser opcional.

Resultado Esperado:

Dados completos do questionário (se existir).

### 5.2 POST /questionarios/:id/respostas
**Caso de Uso:**

Registro de resposta a um questionário.

**Regras de Negócio:**

Apenas usuários matriculados no curso podem responder.

Número da resposta deve ser válido.

**Resultado Esperado:**

Confirmação de registro da resposta.

## 6. Certificados
### 6.1 GET /usuarios/:id/certificados
**Caso de Uso:**

Listagem de certificados emitidos para um usuário.

**Regras de Negócio:**

Apenas o próprio usuário ou administradores podem acessar.

Certificados gerados automaticamente ao concluir cursos.

**Resultado Esperado:**

Lista de certificados do usuário.

### Regras Gerais:

Autenticação: Todas as rotas (exceto login) requerem token JWT válido.

Validação: Campos marcados como required nos models são obrigatórios.

### Hierarquia:

Cursos contêm aulas.

Aulas podem ter questionários.

Conclusão de cursos gera certificados.

### Fluxo Principal

Login → /auth/login

Listar cursos → /cursos

Matricular-se → PATCH /usuarios/:id

Acessar aulas → /cursos/:id/aulas

Responder questionários → POST /questionarios/:id/respostas

Emissão de certificado → GET /usuarios/:id/certificados