import express from "express";
import CursoController from '../controllers/CursoController.js';
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const cursoController = new CursoController();

router.post('/cursos', asyncWrapper(cursoController.criar.bind(cursoController))); // Criar curso
router.get('/cursos', asyncWrapper(cursoController.listar.bind(cursoController))); // Listar cursos
router.put('/cursos/:id', asyncWrapper(cursoController.atualizar.bind(cursoController))); // Atualizar curso
router.delete('/cursos/:id', asyncWrapper(cursoController.deletar.bind(cursoController))); // Deletar curso

export default router;