# Roteiro para Testar a Integridade Referencial

Este roteiro descreve o processo completo para testar a integridade referencial entre cursos, aulas, questionários e demais entidades do sistema. Siga os passos abaixo para validar se as implementações de atualização automática da carga horária e exclusão em cascata estão funcionando corretamente.

## 1. Preparação do Ambiente

### 1.1. Configuração do Postman
- Crie uma nova coleção chamada "Teste de Integridade Referencial"
- Configure variáveis de ambiente:
  - `base_url`: URL base da sua API (ex: http://localhost:3000/api)
  - `auth_token`: Após login, salve o token aqui

### 1.2. Login para Obter Token de Autenticação
```
POST {{base_url}}/usuarios/login
Content-Type: application/json

{
  "email": "seu_email@exemplo.com",
  "senha": "sua_senha"
}
```
- Salve o token recebido na variável `auth_token`

## 2. Criação de Cursos

### 2.1. Criar Curso 1: Curso Básico
```
POST {{base_url}}/cursos
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "titulo": "Programação Básica",
  "descricao": "Curso introdutório de programação",
  "thumbnail": "https://exemplo.com/thumbnail1.jpg",
  "professores": ["Prof. Silva"],
  "tags": ["programação", "iniciante"],
  "criadoPorId": "ID_DO_USUARIO_LOGADO"
}
```
- Salvar o ID do curso em `curso1_id`

### 2.2. Criar Curso 2: Curso Intermediário
```
POST {{base_url}}/cursos
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "titulo": "Desenvolvimento Web",
  "descricao": "Desenvolvimento web com HTML, CSS e JavaScript",
  "thumbnail": "https://exemplo.com/thumbnail2.jpg",
  "professores": ["Prof. Santos", "Profa. Oliveira"],
  "tags": ["web", "frontend", "intermediário"],
  "criadoPorId": "ID_DO_USUARIO_LOGADO"
}
```
- Salvar o ID do curso em `curso2_id`

### 2.3. Criar Curso 3: Curso Avançado
```
POST {{base_url}}/cursos
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "titulo": "API REST com Node.js",
  "descricao": "Desenvolvimento de APIs RESTful com Node.js e MongoDB",
  "thumbnail": "https://exemplo.com/thumbnail3.jpg",
  "professores": ["Prof. Pereira"],
  "tags": ["backend", "api", "avançado", "nodejs"],
  "criadoPorId": "ID_DO_USUARIO_LOGADO"
}
```
- Salvar o ID do curso em `curso3_id`

### 2.4. Verificar os Cursos Criados
```
GET {{base_url}}/cursos
Authorization: Bearer {{auth_token}}
```
- Verificar se os 3 cursos aparecem na listagem
- Observe que a `cargaHorariaTotal` deve ser 0 para todos

## 3. Criação de Aulas para o Curso 1

### 3.1. Criar Aula 1.1
```
POST {{base_url}}/aulas
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "titulo": "Introdução à Lógica",
  "descricao": "Conceitos básicos de lógica de programação",
  "conteudoURL": "https://exemplo.com/aula1-1",
  "cargaHoraria": 60,
  "cursoId": "{{curso1_id}}"
}
```
- Salvar o ID da aula em `aula1_1_id`

### 3.2. Criar Aula 1.2
```
POST {{base_url}}/aulas
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "titulo": "Variáveis e Tipos de Dados",
  "descricao": "Entendendo variáveis e tipos primitivos",
  "conteudoURL": "https://exemplo.com/aula1-2",
  "cargaHoraria": 90,
  "cursoId": "{{curso1_id}}"
}
```
- Salvar o ID da aula em `aula1_2_id`

### 3.3. Verificar o Curso 1 Atualizado
```
GET {{base_url}}/cursos/{{curso1_id}}
Authorization: Bearer {{auth_token}}
```
- Verificar que a `cargaHorariaTotal` agora é 150 (60 + 90)
- Verificar que `totalAulas` mostra 2

## 4. Criação de Aulas para o Curso 2

### 4.1. Criar Aula 2.1
```
POST {{base_url}}/aulas
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "titulo": "HTML Básico",
  "descricao": "Introdução ao HTML",
  "conteudoURL": "https://exemplo.com/aula2-1",
  "cargaHoraria": 120,
  "cursoId": "{{curso2_id}}"
}
```
- Salvar o ID da aula em `aula2_1_id`

### 4.2. Criar Aula 2.2
```
POST {{base_url}}/aulas
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "titulo": "CSS Básico",
  "descricao": "Introdução ao CSS",
  "conteudoURL": "https://exemplo.com/aula2-2",
  "cargaHoraria": 180,
  "cursoId": "{{curso2_id}}"
}
```
- Salvar o ID da aula em `aula2_2_id`

### 4.3. Verificar o Curso 2 Atualizado
```
GET {{base_url}}/cursos/{{curso2_id}}
Authorization: Bearer {{auth_token}}
```
- Verificar que a `cargaHorariaTotal` agora é 300 (120 + 180)

## 5. Criação de Questionários para as Aulas

### 5.1. Criar Questionário para Aula 1.1
```
POST {{base_url}}/questionarios
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "titulo": "Teste de Lógica",
  "descricao": "Avaliação sobre lógica de programação",
  "aulaId": "{{aula1_1_id}}"
}
```
- Salvar o ID do questionário em `questionario1_1_id`

### 5.2. Criar Alternativas para o Questionário 1.1
```
POST {{base_url}}/alternativas
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "texto": "Algoritmo é uma sequência finita de instruções",
  "correta": true,
  "questionarioId": "{{questionario1_1_id}}"
}
```

```
POST {{base_url}}/alternativas
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "texto": "Algoritmo é uma sequência infinita de instruções",
  "correta": false,
  "questionarioId": "{{questionario1_1_id}}"
}
```

### 5.3. Criar Questionário para Aula 2.1
```
POST {{base_url}}/questionarios
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "titulo": "Teste de HTML",
  "descricao": "Avaliação sobre HTML básico",
  "aulaId": "{{aula2_1_id}}"
}
```
- Salvar o ID do questionário em `questionario2_1_id`

### 5.4. Criar Alternativas para o Questionário 2.1
```
POST {{base_url}}/alternativas
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "texto": "HTML significa HyperText Markup Language",
  "correta": true,
  "questionarioId": "{{questionario2_1_id}}"
}
```

```
POST {{base_url}}/alternativas
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "texto": "HTML é uma linguagem de programação",
  "correta": false,
  "questionarioId": "{{questionario2_1_id}}"
}
```

### 5.5. Verificar os Cursos com Estatísticas Atualizadas
```
GET {{base_url}}/cursos/{{curso1_id}}
Authorization: Bearer {{auth_token}}
```
- Verificar que `totalQuestionarios` é 1 e `totalAlternativas` é 2

```
GET {{base_url}}/cursos/{{curso2_id}}
Authorization: Bearer {{auth_token}}
```
- Verificar que `totalQuestionarios` é 1 e `totalAlternativas` é 2

## 6. Testes de Atualização

### 6.1. Atualizar a Carga Horária de uma Aula
```
PUT {{base_url}}/aulas/{{aula1_1_id}}
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "cargaHoraria": 75
}
```

### 6.2. Verificar Atualização Automática da Carga Horária do Curso
```
GET {{base_url}}/cursos/{{curso1_id}}
Authorization: Bearer {{auth_token}}
```
- Verificar que a `cargaHorariaTotal` agora é 165 (75 + 90)

### 6.3. Mover uma Aula para Outro Curso
```
PUT {{base_url}}/aulas/{{aula1_2_id}}
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "cursoId": "{{curso3_id}}"
}
```

### 6.4. Verificar Atualização Automática em Ambos os Cursos
```
GET {{base_url}}/cursos/{{curso1_id}}
Authorization: Bearer {{auth_token}}
```
- Verificar que a `cargaHorariaTotal` agora é apenas 75 (sem a aula 1.2)
- Verificar que `totalAulas` agora é 1

```
GET {{base_url}}/cursos/{{curso3_id}}
Authorization: Bearer {{auth_token}}
```
- Verificar que a `cargaHorariaTotal` agora é 90 (a carga da aula 1.2)
- Verificar que `totalAulas` agora é 1

## 7. Testes de Exclusão em Cascata

### 7.1. Excluir uma Aula Individual
```
DELETE {{base_url}}/aulas/{{aula2_2_id}}
Authorization: Bearer {{auth_token}}
```

### 7.2. Verificar Atualização Automática do Curso 2
```
GET {{base_url}}/cursos/{{curso2_id}}
Authorization: Bearer {{auth_token}}
```
- Verificar que a `cargaHorariaTotal` agora é 120 (apenas a aula 2.1)
- Verificar que `totalAulas` agora é 1

### 7.3. Excluir o Curso 1 (com todas suas dependências)
```
DELETE {{base_url}}/cursos/{{curso1_id}}
Authorization: Bearer {{auth_token}}
```
- Verificar o resultado retornado com as estatísticas:
  - Curso excluído: "Programação Básica"
  - Aulas excluídas: 1
  - Questionários excluídos: 1
  - Alternativas excluídas: 2

### 7.4. Verificar que o Curso 1 foi Excluído
```
GET {{base_url}}/cursos/{{curso1_id}}
Authorization: Bearer {{auth_token}}
```
- Deve retornar erro 404 (Not Found)

### 7.5. Verificar que as Aulas do Curso 1 foram Excluídas
```
GET {{base_url}}/aulas?cursoId={{curso1_id}}
Authorization: Bearer {{auth_token}}
```
- Deve retornar uma lista vazia ou mensagem de que não foram encontradas aulas

### 7.6. Verificar que os Questionários da Aula 1.1 foram Excluídos
```
GET {{base_url}}/questionarios/{{questionario1_1_id}}
Authorization: Bearer {{auth_token}}
```
- Deve retornar erro 404 (Not Found)

## 8. Teste de Integridade Referencial Completo

### 8.1. Criar um Novo Usuário para Teste
```
POST {{base_url}}/usuarios
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "nome": "Estudante Teste",
  "email": "estudante@teste.com",
  "senha": "senha123",
  "perfil": "estudante"
}
```
- Salvar o ID do usuário em `usuario_teste_id`

### 8.2. Matricular o Usuário no Curso 2
```
PUT {{base_url}}/usuarios/{{usuario_teste_id}}/cursos/{{curso2_id}}
Authorization: Bearer {{auth_token}}
```

### 8.3. Adicionar Progresso ao Usuário no Curso 2
```
POST {{base_url}}/usuarios/{{usuario_teste_id}}/progresso
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "curso": "{{curso2_id}}",
  "percentual_conclusao": "50"
}
```

### 8.4. Tentar Excluir o Curso 2 (deve falhar devido ao progresso significativo)
```
DELETE {{base_url}}/cursos/{{curso2_id}}
Authorization: Bearer {{auth_token}}
```
- Deve retornar erro 409 (Conflict)
- Verificar a mensagem de erro sobre o progresso significativo

### 8.5. Excluir o Curso 3 (sem usuários com progresso significativo)
```
DELETE {{base_url}}/cursos/{{curso3_id}}
Authorization: Bearer {{auth_token}}
```
- Deve excluir com sucesso
- Verificar estatísticas retornadas

### 8.6. Verificar Remoção de Referências nos Usuários
```
GET {{base_url}}/usuarios/{{usuario_teste_id}}
Authorization: Bearer {{auth_token}}
```
- Verificar que o progresso relacionado ao curso excluído (se estava associado) foi removido

## 9. Limpeza

### 9.1. Excluir o Usuário de Teste
```
DELETE {{base_url}}/usuarios/{{usuario_teste_id}}
Authorization: Bearer {{auth_token}}
```

### 9.2. Excluir o Último Curso
```
DELETE {{base_url}}/cursos/{{curso2_id}}
Authorization: Bearer {{auth_token}}
```
- Primeiro remova o progresso do usuário para permitir a exclusão

## Resumo dos Testes

Este roteiro testa completamente:

1. **Criação de Entidades**: Cursos, aulas, questionários e alternativas
2. **Atualização da Carga Horária**: Verificação da atualização automática da carga horária total 
3. **Cálculo de Estatísticas**: Contagem correta de recursos associados aos cursos
4. **Transferência de Aulas**: Atualização da carga horária quando uma aula é movida entre cursos
5. **Exclusão em Cascata**: Funcionamento correto da exclusão hierárquica
6. **Integridade Referencial**: Proteção contra exclusão de cursos com progresso significativo
7. **Limpeza de Referências**: Remoção adequada de referências em entidades relacionadas

## Resultados Esperados

Ao final deste roteiro, todos os seguintes aspectos devem ter sido validados:

- Criação e relacionamento adequado entre entidades
- Atualização automática da carga horária dos cursos quando aulas são adicionadas/alteradas/removidas
- Estatísticas corretas e atualizadas em tempo real
- Exclusão em cascata funcionando corretamente
- Proteção contra exclusão de cursos com usuários ativos
- Limpeza adequada de referências em entidades relacionadas

## Notas

- Substitua os IDs e tokens pelos valores reais durante a execução dos testes
- Documente quaisquer problemas encontrados para correções posteriores
