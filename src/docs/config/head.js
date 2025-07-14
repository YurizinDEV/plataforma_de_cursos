import authSchemas from "../schemas/authSchema.js";
import usuariosSchemas from "../schemas/usuariosSchema.js";
import cursosSchemas from "../schemas/cursosSchema.js";
// import aulasSchemas from "../schemas/aulaSchema.js";
// import questionariosSchemas from "../schemas/questionarioSchema.js";
// import alternativasSchemas from "../schemas/alternativaSchema.js";
// import certificadosSchemas from "../schemas/certificadoSchema.js";

import authPaths from "../paths/auth.js";
import usuariosPaths from "../paths/usuarios.js";
import cursosPaths from "../paths/cursos.js";
// import aulasPaths from "../paths/aulas.js";
// import questionariosPaths from "../paths/questionarios.js";
// import alternativasPaths from "../paths/alternativas.js";
// import certificadosPaths from "../paths/certificados.js";

const getServersInCorrectOrder = () => {
    const PORT = process.env.APP_PORT || 5010;
    const devUrl = { url: process.env.SWAGGER_DEV_URL || `http://localhost:${PORT}` };

    if (process.env.NODE_ENV === "production") return [devUrl];
    else return [devUrl];
};

const getSwaggerOptions = () => {
    return {
        swaggerDefinition: {
            openapi: "3.0.0",
            info: {
                title: "API Plataforma de Cursos",
                version: "1.0.0",
                description: "API para gestão de cursos online \n\nÉ necessário autenticar com token JWT antes de utilizar a maioria das rotas. Faça isso na rota /login com um email e senha válido. Esta API conta com refresh token, que pode ser obtido na rota /refresh, e com logout, que pode ser feito na rota /logout. Para revogação de acesso use a rota /revoke. Para mais informações, acesse a documentação.",
                contact: {
                    name: "Equipe de Desenvolvimento",
                    email: "dev@plataforma-cursos.com",
                },
            },
            servers: getServersInCorrectOrder(),
            tags: [
                {
                    name: "Auth",
                    description: "Rotas para autenticação e autorização"
                },
                {
                    name: "Usuários",
                    description: "Rotas para gestão de usuários"
                },
                {
                    name: "Cursos",
                    description: "Rotas para gestão de cursos"
                },
                {
                    name: "Aulas",
                    description: "Rotas para gestão de aulas"
                },
                {
                    name: "Questionários",
                    description: "Rotas para gestão de questionários"
                },
                {
                    name: "Alternativas",
                    description: "Rotas para gestão de alternativas"
                },
                {
                    name: "Certificados",
                    description: "Rotas para gestão de certificados"
                }
            ],
            paths: {
                ...authPaths,
                ...usuariosPaths,
                ...cursosPaths,
                // ...aulasPaths,
                // ...questionariosPaths,
                // ...alternativasPaths,
                // ...certificadosPaths,
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT"
                    }
                },
                schemas: {
                    ...authSchemas,
                    ...usuariosSchemas,
                    ...cursosSchemas,
                    // ...aulasSchemas,
                    // ...questionariosSchemas,
                    // ...alternativasSchemas,
                    // ...certificadosSchemas,
                }
            },
            security: [{
                bearerAuth: []
            }]
        },
        apis: ["./src/routes/*.js"]
    };
};

export { getSwaggerOptions };
