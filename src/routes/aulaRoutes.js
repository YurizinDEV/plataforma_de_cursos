import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import authPermission from '../middlewares/AuthPermission.js';
import AulaController from "../controllers/AulaController.js";
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const aulaController = new AulaController();

router
    .get("/aulas", AuthMiddleware, authPermission, asyncWrapper(aulaController.listar.bind(aulaController)))
    .get("/aulas/:id", AuthMiddleware, authPermission, asyncWrapper(aulaController.acessar.bind(aulaController)))
    .post("/aulas", AuthMiddleware, authPermission, asyncWrapper(aulaController.criar.bind(aulaController)))
    .put("/aulas/:id", AuthMiddleware, authPermission, asyncWrapper(aulaController.atualizar.bind(aulaController)))
    .delete("/aulas/:id", AuthMiddleware, authPermission, asyncWrapper(aulaController.deletar.bind(aulaController)))

export default router;