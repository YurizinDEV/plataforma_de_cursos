# Documentação de Rotas - Plataforma de Cursos

## 1. Autenticação  

### 1.1 POST /login  

**Caso de Uso** 
Autenticar usuário no sistema para permitir acesso às funcionalidades da plataforma.  

**Regras de Negócio**
- Validar se o e-mail está cadastrado no sistema;  
- Verificar se a senha corresponde ao usuário;  
- Identificar tipo de usuário (usuário/administrador) para controle de acesso.  

**Resultado Esperado**
- Retornar confirmação de autenticação bem-sucedida;  
- Informar tipo de usuário para redirecionamento adequado;  
- Em caso de falha, retornar mensagem de erro específica (credenciais inválidas, usuário não encontrado).  

## 2. Dashboard  

### 2.1 GET /home  

**Caso de Uso**
Exibir informações resumidas relevantes ao usuário após login.  

**Regras de Negócio**
- Para alunos: mostrar cursos ativos, progresso e notificações;  
- Para professores: mostrar cursos ministrados, estatísticas e alertas;  
- Personalizar conteúdo conforme perfil do usuário.  

**Resultado Esperado**
- Retornar dados consolidados para o dashboard;  
- Incluir cursos ativos/ministrados e notificações recentes;  
- Em caso de falha, retornar erro de permissão.  

## 3. Gestão de Perfil  

### 3.1 GET /perfil  

**Caso de Uso**
Visualizar informações completas do perfil do usuário.  

**Regras de Negócio**
- Apenas o próprio usuário pode acessar seu perfil completo;  
- Retornar dados sensíveis apenas para o dono do perfil;  
- Incluir histórico de cursos e progresso para alunos;  
- Incluir estatísticas de cursos para professores.  

**Resultado Esperado**
- Retornar objeto completo com todas as informações do perfil;  
- Incluir dados acadêmicos/profissionais conforme tipo de usuário;  
- Em caso de acesso não autorizado, retornar erro 403.  

### 3.2 PUT/PATCH /perfil  

**Caso de Uso**
Atualizar informações do perfil do usuário.  

**Regras de Negócio**
- Validar campos obrigatórios (nome, e-mail);  
- Garantir unicidade do e-mail no sistema;  
- Criptografar nova senha caso seja alterada;  
- Restringir atualização de campos sensíveis (como tipo de usuário).  

**Resultado Esperado**
- Confirmar atualização bem-sucedida dos dados;  
- Retornar apenas os campos que foram modificados;  
- Em caso de erro, especificar qual validação falhou.  

## 4. Gestão de Cursos  

### 4.1 GET /cursos  

**Caso de Uso**
Listar todos os cursos disponíveis na plataforma.  

**Regras de Negócio**
- Para alunos: mostrar apenas cursos disponíveis para matrícula;  
- Para professores: incluir cursos próprios em qualquer status;  
- Paginar resultados quando houver muitos cursos;  
- Ordenar por relevância/data de criação.  

**Resultado Esperado**
- Retornar array com informações essenciais dos cursos;  
- Incluir metadados para paginação quando aplicável;  
- Em caso de nenhum curso, retornar array vazio.  

### 4.2 GET /curso/:id  

**Caso de Uso**
Visualizar detalhes completos de um curso específico.  

**Regras de Negócio**
- Verificar se curso existe e está disponível;  
- Para cursos não publicados, restringir acesso ao professor responsável;  
- Incluir informações sobre aulas, professor e requisitos;  
- Mostrar status de matrícula para alunos autenticados.  

**Resultado Esperado**
- Retornar objeto completo com todos os detalhes do curso;  
- Incluir lista de aulas e informações do professor;  
- Em caso de acesso não autorizado, retornar erro 403.  

### 4.3 POST /curso/:id/matricula  

**Caso de Uso**
Matricular aluno em um curso disponível.  

**Regras de Negócio**
- Verificar se aluno atende aos pré-requisitos do curso;  
- Confirmar disponibilidade de vagas;  
- Evitar matrículas duplicadas;  
- Registrar data/hora da matrícula.  

**Resultado Esperado**
- Retornar confirmação de matrícula bem-sucedida;  
- Incluir ID da matrícula criada;  
- Em caso de falha, especificar motivo (vagas esgotadas, pré-requisitos não atendidos).  

## 5. Conteúdo Educacional  

### 5.1 GET /aula/:id  

**Caso de Uso**
Acessar conteúdo completo de uma aula.  

**Regras de Negócio**
- Verificar se usuário está matriculado no curso;  
- Controlar acesso conforme progresso do aluno;  
- Para professores: permitir acesso a qualquer aula de seus cursos;  
- Registrar visualização para acompanhamento de progresso.  

**Resultado Esperado**
- Retornar todos os elementos da aula (vídeo, materiais, etc.);  
- Incluir informações de progresso e conclusão;  
- Em caso de acesso não autorizado, retornar erro 403.  

## 6. Avaliações  

### 6.1 GET /questionario/:id  

**Caso de Uso**
Carregar questionário associado a uma aula.  

**Regras de Negócio**
- Verificar se usuário completou a aula correspondente;  
- Mostrar apenas perguntas ativas;  
- Aleatorizar ordem das questões e alternativas (quando configurado);  
- Limitar tempo de resposta quando aplicável.  

**Resultado Esperado**
- Retornar todas as perguntas do questionário;  
- Incluir metadados sobre tempo limite e pontuação;  
- Em caso de acesso indevido, retornar erro 403.  

### 6.2 POST /questionario/:id  

**Caso de Uso**
Submeter respostas de um questionário.  

**Regras de Negócio**
- Validar se todas as questões obrigatórias foram respondidas;  
- Verificar tempo de resposta quando aplicável;  
- Calcular pontuação conforme gabarito;  
- Registrar tentativa e impedir novo envio quando configurado.  

**Resultado Esperado**
- Retornar pontuação obtida e feedback;  
- Incluir correções quando permitido pelas configurações;  
- Em caso de submissão inválida, especificar o motivo.  

## 7. Certificação  

### 7.1 GET /certificado/:id  

**Caso de Uso**
Emitir certificado de conclusão de curso.  

**Regras de Negócio**
- Verificar se usuário completou todos os requisitos do curso;  
- Validar se certificado já foi emitido anteriormente;  
- Gerar documento com informações do curso e desempenho;  
- Registrar data de emissão e código de validação.  

**Resultado Esperado**
- Retornar certificado em formato PDF ou link para download;  
- Incluir informações de validação do documento;  
- Em caso de requisitos não atendidos, retornar erro 400.  

## 8. Gestão de Cursos (Professores)  

### 8.1 POST /criar-curso  

**Caso de Uso**
Cadastrar um novo curso na plataforma.  

**Regras de Negócio**
- Validar campos obrigatórios (nome, descrição, categoria);  
- Associar curso automaticamente ao professor criador;  
- Definir status inicial como "rascunho";  
- Verificar permissões do usuário (apenas administradores).  

**Resultado Esperado**
- Retornar confirmação de criação bem-sucedida;  
- Incluir ID do curso criado para edição posterior;  
- Em caso de falha, especificar quais validações falharam.  

### 8.2 PUT/PATCH /editor-curso/:id  

**Caso de Uso**
Atualizar informações de um curso existente.  

**Regras de Negócio**
- Restringir edição ao professor responsável;  
- Validar mudanças de status (ex: de rascunho para publicado);  
- Manter histórico de alterações importantes;  
- Impedir edição de cursos arquivados.  

**Resultado Esperado**
- Confirmar atualização bem-sucedida dos dados;  
- Retornar apenas os campos que foram modificados;  
- Em caso de erro, especificar restrição violada.  

### 8.3 POST /editor-curso/:id/aulas  

**Caso de Uso**
Adicionar nova aula a um curso.  

**Regras de Negócio**
- Validar campos obrigatórios (título, tipo, conteúdo);  
- Ordenar automaticamente ou conforme especificado;  
- Gerar pré-visualização do conteúdo quando aplicável;  
- Restringir a professores com permissão de edição.  

**Resultado Esperado**
- Retornar confirmação de criação da aula;  
- Incluir ID da aula para edição posterior;  
- Em caso de falha, retornar mensagem de erro específica.  

## Considerações Finais  

1. **Autenticação**: Todas as rotas (exceto /login) requerem autenticação válida;  
2. **Autorização**: Controle de acesso baseado em tipo de usuário (usuário/administrador);  
3. **Validação**: Todos os inputs devem ser validados conforme regras específicas;  
4. **Erros**: Mensagens de erro claras e específicas para cada cenário de falha;  
5. **Logs**: Registrar atividades importantes para auditoria e análise;  
6. **Desempenho**: Implementar paginação e filtros para listagens extensas;  
7. **Segurança**: Proteger contra ataques comuns (SQL injection, XSS, etc.).
