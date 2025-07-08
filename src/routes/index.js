import express from "express";
// import swaggerJsDoc from "swagger-jsdoc";
// import swaggerUI from "swagger-ui-express";
// import getSwaggerOptions from "../docs/config/head.js";
import logRoutes from "../middlewares/LogRoutesMiddleware.js";
import auth from './authRoutes.js';
import usuarios from './usuarioRoutes.js';
import cursos from './cursoRoutes.js';
import aulas from './aulaRoutes.js';
import alternativas from './alternativaRoutes.js';
import certificados from './certificadoRoutes.js';
import questionarios from './questionarioRoutes.js';


import dotenv from "dotenv";

dotenv.config();

const routes = (app) => {
    console.log('=== REGISTRANDO ROTAS ===');
    if (process.env.DEBUGLOG) {
        console.log('DEBUGLOG está ativo - Registrando middleware de log');
        app.use(logRoutes);
        console.log('Middleware de log registrado');
    }
    console.log('Registrando rota GET /');
    app.get("/", (req, res) => {
        console.log('=== ROTA GET / CHAMADA ===');
        res.redirect("/docs");
    }
    );

    // const swaggerDocs = swaggerJsDoc(getSwaggerOptions());
    // app.use(swaggerUI.serve);
    // app.get("/docs", (req, res, next) => {
    //     swaggerUI.setup(swaggerDocs)(req, res, next);
    // });

    console.log('=== REGISTRANDO MIDDLEWARES E ROTAS ===');
    app.use(express.json());
    app.use(auth);
    app.use(usuarios);
    app.use(cursos);
    app.use(aulas);
    app.use(alternativas);
    app.use(questionarios);
    app.use(certificados);

    app.use((req, res) => {
        res.status(404).json({ message: "Rota não encontrada" });
    });
};

export default routes;