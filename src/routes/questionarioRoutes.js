import express from "express";
import QuestionarioController from "../controllers/QuestionarioController.js";
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const questionarioController = new QuestionarioController();

router
  .get("/questionarios", asyncWrapper(questionarioController.listar.bind(questionarioController)))
  .get("/questionarios/:id", asyncWrapper(questionarioController.buscar.bind(questionarioController)))
  .post("/questionarios", asyncWrapper(questionarioController.criar.bind(questionarioController)))
  .put("/questionarios/:id", asyncWrapper(questionarioController.atualizar.bind(questionarioController)))
  .delete("/questionarios/:id", asyncWrapper(questionarioController.deletar.bind(questionarioController)))
  .post("/questionarios/:questionarioId/alternativas/:alternativaId", 
    asyncWrapper(questionarioController.adicionarAlternativa.bind(questionarioController)));

export default router;