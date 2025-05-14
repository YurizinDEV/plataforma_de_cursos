import express from "express";
import PerfilController from '../controllers/PerfilController.js'; // Controller para gestão de perfil
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const perfilController = new PerfilController();

router.get("/perfil", asyncWrapper(perfilController.visualizarPerfil.bind(perfilController)));
router.put("/perfil", asyncWrapper(perfilController.atualizarPerfil.bind(perfilController)));
router.patch("/perfil", asyncWrapper(perfilController.atualizarPerfil.bind(perfilController)));

export default router;