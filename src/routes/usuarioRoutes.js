//usuarioRoutes.js

import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import authPermission from '../middlewares/AuthPermission.js';
import UsuarioController from '../controllers/UsuarioController.js';
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const usuarioController = new UsuarioController(); 

router
    .post("/usuarios", AuthMiddleware, authPermission, asyncWrapper(usuarioController.criar.bind(usuarioController)))
    
    .get("/usuarios", AuthMiddleware, authPermission, asyncWrapper(usuarioController.listar.bind(usuarioController)))
    .get("/usuarios/:id", AuthMiddleware, authPermission, asyncWrapper(usuarioController.listar.bind(usuarioController)))
    .put("/usuarios/:id", AuthMiddleware, authPermission, asyncWrapper(usuarioController.atualizar.bind(usuarioController)))
    .patch("/usuarios/:id", AuthMiddleware, authPermission, asyncWrapper(usuarioController.atualizar.bind(usuarioController)))
    .patch("/usuarios/:id/restaurar", AuthMiddleware, authPermission, asyncWrapper(usuarioController.restaurar.bind(usuarioController)))
    .delete("/usuarios/:id", AuthMiddleware, authPermission, asyncWrapper(usuarioController.deletar.bind(usuarioController)))
    .delete("/usuarios/:id/permanente", AuthMiddleware, authPermission, asyncWrapper(usuarioController.deletarFisicamente.bind(usuarioController)));

export default router;