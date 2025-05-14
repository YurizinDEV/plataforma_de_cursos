import express from "express";
import CursoController from '../controllers/CursoController.js'; // Controller para gestão de cursos
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const cursoController = new CursoController();

router.get("/cursos", asyncWrapper(cursoController.listarCursos.bind(cursoController)));
router.get("/curso/:id", asyncWrapper(cursoController.visualizarCurso.bind(cursoController)));
router.post("/curso/:id/matricula", asyncWrapper(cursoController.matricularAluno.bind(cursoController)));

export default router;