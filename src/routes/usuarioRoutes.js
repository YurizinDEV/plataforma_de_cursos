//usuarioRoutes.js

import express from "express";
// import AuthMiddleware from "../middlewares/AuthMiddleware.js";
// import authPermission from '../middlewares/AuthPermission.js';
import UsuarioController from '../controllers/UsuarioController.js';
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const usuarioController = new UsuarioController(); 

// Definindo as rotas com o controlador e os middlewares necessários
router
    // Rota de teste para simular erro de banco de dados
    .get("/usuarios/teste-erro-banco", asyncWrapper(async (req, res) => {
        try {
            await usuarioController.service.repository.simularErroBanco();
            return res.status(200).json({ message: "Esta rota nunca deve retornar sucesso" });
        } catch (error) {
            throw error;
        }
    }))
    .post("/usuarios", /*AuthMiddleware, authPermission,*/ asyncWrapper(usuarioController.criar.bind(usuarioController)))
    .get("/usuarios", /*AuthMiddleware, authPermission,*/ asyncWrapper(usuarioController.listar.bind(usuarioController)))
    .get("/usuarios/:id", /*AuthMiddleware, authPermission,*/ asyncWrapper(usuarioController.listar.bind(usuarioController)))
    .put("/usuarios/:id", /*AuthMiddleware, authPermission,*/ asyncWrapper(usuarioController.atualizar.bind(usuarioController)))
    .patch("/usuarios/:id", /*AuthMiddleware, authPermission,*/ asyncWrapper(usuarioController.atualizar.bind(usuarioController)))
    .patch("/usuarios/:id/restaurar", /*AuthMiddleware, authPermission,*/ asyncWrapper(usuarioController.restaurar.bind(usuarioController)))
    .delete("/usuarios/:id", /*AuthMiddleware, authPermission,*/ asyncWrapper(usuarioController.deletar.bind(usuarioController)))
    .delete("/usuarios/:id/permanente", /*AuthMiddleware, authPermission,*/ asyncWrapper(usuarioController.deletarFisicamente.bind(usuarioController)));

export default router;