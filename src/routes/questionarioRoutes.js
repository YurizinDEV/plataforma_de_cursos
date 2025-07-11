import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import authPermission from '../middlewares/AuthPermission.js';
import QuestionarioController from "../controllers/QuestionarioController.js";
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const questionarioController = new QuestionarioController();

router
  .get("/questionarios", AuthMiddleware, authPermission, asyncWrapper(questionarioController.listar.bind(questionarioController)))
  .get("/questionarios/:id", AuthMiddleware, authPermission, asyncWrapper(questionarioController.buscar.bind(questionarioController)))
  .post("/questionarios", AuthMiddleware, authPermission, asyncWrapper(questionarioController.criar.bind(questionarioController)))
  .put("/questionarios/:id", AuthMiddleware, authPermission, asyncWrapper(questionarioController.atualizar.bind(questionarioController)))
  .delete("/questionarios/:id", AuthMiddleware, authPermission, asyncWrapper(questionarioController.deletar.bind(questionarioController)))
  .post("/questionarios/:questionarioId/alternativas/:alternativaId", AuthMiddleware, authPermission,
    asyncWrapper(questionarioController.adicionarAlternativa.bind(questionarioController)));

export default router;