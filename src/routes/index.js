// src/app.js

// BIBLIOTECAS
import express from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import getSwaggerOptions from "./docs/config/head.js"; // Altere conforme sua estrutura de diretórios
import dotenv from "dotenv";

// MIDDLEWARES
import logRoutes from "./middlewares/LogRoutesMiddleware.js";

// ROTAS
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import perfilRoutes from "./routes/perfilRoutes.js";
import cursoRoutes from "./routes/cursoRoutes.js";
import aulaRoutes from "./routes/aulaRoutes.js";
import questionarioRoutes from "./routes/questionarioRoutes.js";
import certificadoRoutes from "./routes/certificadoRoutes.js";

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
    app.use("/api/auth", authRoutes); // Rotas de autenticação
    app.use("/api/dashboard", dashboardRoutes); // Rotas do dashboard
    app.use("/api/perfil", perfilRoutes); // Rotas de perfil
    app.use("/api/cursos", cursoRoutes); // Rotas de cursos
    app.use("/api/aulas", aulaRoutes); // Rotas de aulas
    app.use("/api/questionarios", questionarioRoutes); // Rotas de questionários
    app.use("/api/certificados", certificadoRoutes); // Rotas de certificados
};

// Chama a função para definir as rotas
routes(app);

// Exporta a aplicação para ser usada em outros módulos
export default app;