// cursoRoutes.js

import express from "express";
// import AuthMiddleware from "../middlewares/AuthMiddleware.js";
// import authPermission from '../middlewares/AuthPermission.js';
import CursoController from '../controllers/CursoController.js';
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const cursoController = new CursoController();

router.post('/cursos', /*AuthMiddleware, authPermission,*/ asyncWrapper(cursoController.criar.bind(cursoController))); 
router.get('/cursos',  /*AuthMiddleware, authPermission,*/ asyncWrapper(cursoController.listar.bind(cursoController)));
router.get('/cursos/:id', /*AuthMiddleware, authPermission,*/ asyncWrapper(cursoController.listar.bind(cursoController))); 
// router.put('/cursos/:id', /*AuthMiddleware, authPermission,*/ asyncWrapper(cursoController.atualizar.bind(cursoController)));
// router.delete('/cursos/:id', /*AuthMiddleware, authPermission,*/ asyncWrapper(cursoController.deletar.bind(cursoController))); 

export default router;