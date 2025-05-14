// src/routes/index.js

// BIBLIOTECAS
import express from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import getSwaggerOptions from "./docs/config/head.js"; // Altere conforme sua estrutura de diretórios
import dotenv from "dotenv";

// MIDDLEWARES
import logRoutes from "./middlewares/LogRoutesMiddleware.js";

// ROTAS
import auth from "./authRoutes.js";
import dashboard from "./dashboardRoutes.js";
import perfil from "./perfilRoutes.js";
import curso from "./cursoRoutes.js";
import aula from "./aulaRoutes.js";
import questionario from "./questionarioRoutes.js";
import certificado from "./certificadoRoutes.js";

// CONFIGURAÇÃO DO AMBIENTE
dotenv.config();

const app = express();

// Configuração do Swagger
const swaggerDocs = swaggerJsDoc(getSwaggerOptions());

// Função que define as rotas da aplicação
const routes = (app) => {
    // Ativa o log das rotas se DEBUGLOG estiver habilitado
    if (process.env.DEBUGLOG) {
        app.use(logRoutes);
    }

    // Rota para redirecionar da raiz para /docs
    app.get("/", (req, res) => {
        res.redirect("/docs");
    });

    // Configuração do Swagger e criação da rota /docs
    app.use(swaggerUI.serve);
    app.get("/docs", (req, res, next) => {
        swaggerUI.setup(swaggerDocs)(req, res, next);
    });

    // Middleware para permitir requisições JSON
    app.use(express.json());

    // Configurando as rotas
    app.use("/api/auth", auth); // Rotas de autenticação
    app.use("/api/dashboard", dashboard); // Rotas do dashboard
    app.use("/api/perfil", perfil); // Rotas de perfil
    app.use("/api/cursos", curso); // Rotas de cursos
    app.use("/api/aulas", aula); // Rotas de aulas
    app.use("/api/questionarios", questionario); // Rotas de questionários
    app.use("/api/certificados", certificado); // Rotas de certificados
};

// Chama a função para definir as rotas
routes(index);

export default routes;
