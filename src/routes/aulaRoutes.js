import express from "express";
import AulaController from '../controllers/AulaController.js'; // Controller para gestão de aulas
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const aulaController = new AulaController();

router.get("/aula/:id", asyncWrapper(aulaController.acessarAula.bind(aulaController)));

export default router;