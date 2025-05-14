import express from "express";
import QuestionarioController from '../controllers/QuestionarioController.js'; // Controller para gestão de questionários
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const questionarioController = new QuestionarioController();

router.get("/questionario/:id", asyncWrapper(questionarioController.carregarQuestionario.bind(questionarioController)));
router.post("/questionario/:id", asyncWrapper(questionarioController.submeterQuestionario.bind(questionarioController)));

export default router;