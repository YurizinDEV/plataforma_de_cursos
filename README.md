# 🎓 Plataforma de Cursos

Uma API completa para gestão de cursos online, desenvolvida como projeto da disciplina de Fábrica de Software do IFRO.

## 📋 Sobre o Projeto

A Plataforma de Cursos é uma API RESTful que oferece funcionalidades completas para gerenciamento de cursos online, incluindo:

- 👥 **Gestão de Usuários**: Cadastro, autenticação, permissões e grupos
- 📚 **Gestão de Cursos**: CRUD completo com soft delete e hard delete
- 🎯 **Sistema de Aulas**: Organização do conteúdo em módulos
- 📝 **Questionários**: Sistema de avaliação com alternativas
- 🏆 **Certificados**: Emissão automática de certificados
- 🔐 **Autenticação JWT**: Sistema seguro com refresh tokens
- 📊 **Documentação Swagger**: Interface interativa para testes
- 🧪 **Testes Automatizados**: Cobertura completa com Jest

## 🛠️ Tecnologias Utilizadas

- **Node.js** + **Express.js** - Backend
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação e autorização
- **Swagger** - Documentação da API
- **Jest** - Testes automatizados
- **Docker** - Containerização
- **Zod** - Validação de schemas
- **Winston** - Sistema de logs

## 🚀 Como Executar o Projeto

### 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Docker](https://www.docker.com/get-started) (versão 20.10 ou superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (versão 2.0 ou superior)
- [Git](https://git-scm.com/) para clonar o repositório

### 📁 1. Clonando o Repositório

```bash
git clone https://gitlab.fslab.dev/f-brica-de-software-ii-2025-1/plataforma-de-cursos.git
cd plataforma-de-cursos
```

### ⚙️ 2. Configuração do Ambiente

O projeto já vem com um arquivo `.env.example` configurado. Copie-o para `.env`:

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

As configurações padrão já estão otimizadas para execução com Docker.

### 🐳 3. Executando com Docker

Execute o comando abaixo para iniciar todos os serviços:

```bash
docker compose up --build --force-recreate
```

Este comando irá:
- 🏗️ Construir as imagens Docker
- 🚀 Iniciar o MongoDB com replica set (necessário para transações)
- 🌐 Iniciar a API na porta 5010
- 📊 Configurar automaticamente o banco de dados

**Aguarde até ver a mensagem:** `✅ Conectado ao MongoDB com sucesso!`

### 📊 4. Populando o Banco de Dados

Em um novo terminal, execute os seeds para popular o banco com dados de exemplo:

```bash
docker exec -it plataforma-cursos-api sh
npm run seed
exit
```

Os seeds irão criar:
- 👤 Usuários de exemplo (admin, professores, alunos)
- 📚 Cursos de exemplo
- 🎯 Aulas e questionários
- 🏆 Certificados

### 🧪 5. Executando os Testes

Para rodar os testes automatizados:

```bash
docker exec -it plataforma-cursos-api sh
npm test
exit
```

### 🌐 6. Acessando a Aplicação

Após a inicialização completa, você pode acessar:

- **📖 Documentação Swagger**: http://localhost:5010/docs
- **🔌 API Base**: http://localhost:5010

## 📱 Testando a API

### 🔐 1. Fazendo Login

Acesse a documentação Swagger em http://localhost:5010/docs e use as credenciais padrão:

**Admin:**
```json
{
  "email": "admin@gmail.com",
  "senha": "Admin@1234"
}
```

**Professor:**
```json
{
  "email": "professor@gmail.com",
  "senha": "Professor@1234"
}
```

### 🎯 2. Testando Endpoints

1. Na rota `/login`, faça o login para obter o token JWT
2. Copie o token retornado
3. Clique em "Authorize" no topo da página Swagger
4. Cole o token no formato: `Bearer SEU_TOKEN_AQUI`
5. Agora você pode testar todos os endpoints protegidos

## 🏗️ Estrutura do Projeto

```
src/
├── controllers/        # Controladores da API
├── models/            # Modelos do MongoDB
├── repositories/      # Camada de acesso a dados
├── services/          # Lógica de negócio
├── routes/            # Definição das rotas
├── middlewares/       # Middlewares customizados
├── utils/             # Utilitários e helpers
├── docs/              # Documentação Swagger
├── seeds/             # Scripts para popular o banco
├── tests/             # Testes automatizados
└── config/            # Configurações do projeto
```

## 🔧 Comandos Úteis

### 📦 Gerenciamento do Container

```bash
# Parar todos os serviços
docker compose down

# Reiniciar apenas a API
docker compose restart api

# Ver logs da API
docker compose logs -f api

# Ver logs do MongoDB
docker compose logs -f mongodb
```

### 🗄️ Gerenciamento do Banco

```bash
# Acessar o MongoDB diretamente
docker exec -it plataforma-cursos-mongodb mongosh

# Resetar o banco de dados
docker compose down -v
docker compose up --build --force-recreate
```

### 🧪 Desenvolvimento

```bash
# Entrar no container da API
docker exec -it plataforma-cursos-api sh

# Rodar em modo desenvolvimento (dentro do container)
npm run dev

# Gerar relatório de cobertura de testes
npm test
```

## 🚨 Solução de Problemas

### ❌ Erro de Conexão com MongoDB

Se você receber erros de conexão:

1. Verifique se o Docker está rodando
2. Execute: `docker compose down -v && docker compose up --build --force-recreate`
3. Aguarde a mensagem de conexão bem-sucedida

### ❌ Porta 5010 já está em uso

Se a porta estiver ocupada:

1. Pare o processo que está usando a porta
2. Ou altere a porta no arquivo `.env`: `APP_PORT=5011`

### ❌ Erros de Permissão no Docker

No Linux/Mac, se tiver problemas de permissão:

```bash
sudo docker compose up --build --force-recreate
```

## 📚 Funcionalidades Principais

### 🔐 Sistema de Autenticação
- Login com email/senha
- JWT tokens com refresh token
- Sistema de permissões baseado em grupos
- Logout e revogação de tokens

### 👥 Gestão de Usuários
- CRUD completo de usuários
- Sistema de grupos e permissões
- Soft delete e hard delete
- Ativação/desativação de contas

### 📚 Gestão de Cursos
- Criação e edição de cursos
- Sistema de aulas organizadas
- Material complementar
- Status do curso (ativo, inativo, rascunho, arquivado)

### 📝 Sistema de Avaliação
- Questionários com múltiplas alternativas
- Certificados automáticos
- Histórico de tentativas

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvedores

Projeto desenvolvido por estudantes do IFRO como parte da disciplina de Fábrica de Software.

---

⭐ Se este projeto te ajudou, deixe uma estrela!
