import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import authPermission from '../middlewares/AuthPermission.js';
import RotaController from '../controllers/RotaController.js';
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const rotaController = new RotaController(); 

router
    .post("/rotas", AuthMiddleware, authPermission, asyncWrapper(rotaController.criar.bind(rotaController)))
    .get("/rotas", AuthMiddleware, authPermission, asyncWrapper(rotaController.listar.bind(rotaController)))
    .get("/rotas/:id", AuthMiddleware, authPermission, asyncWrapper(rotaController.listar.bind(rotaController)))
    .put("/rotas/:id", AuthMiddleware, authPermission, asyncWrapper(rotaController.atualizar.bind(rotaController)))
    .patch("/rotas/:id", AuthMiddleware, authPermission, asyncWrapper(rotaController.atualizar.bind(rotaController)))
    .delete("/rotas/:id", AuthMiddleware, authPermission, asyncWrapper(rotaController.deletar.bind(rotaController)));

export default router;
