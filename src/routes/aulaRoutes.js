import express from "express";
import AulaController from "../controllers/AulaController.js";
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const aulaController = new AulaController();

router
    .get("/aulas", asyncWrapper(aulaController.listar.bind(aulaController)))
    .get("/aulas/:id", asyncWrapper(aulaController.acessar.bind(aulaController)))
    .post("/aulas", asyncWrapper(aulaController.criar.bind(aulaController)))
    .put("/aulas/:id", asyncWrapper(aulaController.atualizar.bind(aulaController)))
    .delete("/aulas/:id", asyncWrapper(aulaController.deletar.bind(aulaController)))
    .get("/aulas/paginado", asyncWrapper(aulaController.listarPaginado.bind(aulaController)));

export default router;