import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import authPermission from '../middlewares/AuthPermission.js';
import AlternativaController from "../controllers/AlternativaController.js";
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const alternativaController = new AlternativaController();

router
  .get("/alternativas", AuthMiddleware, authPermission, asyncWrapper(alternativaController.listar.bind(alternativaController)))
  .get("/alternativas/:id", AuthMiddleware, authPermission, asyncWrapper(alternativaController.buscar.bind(alternativaController)))
  .post("/alternativas", AuthMiddleware, authPermission, asyncWrapper(alternativaController.criar.bind(alternativaController)))
  .put("/alternativas/:id", AuthMiddleware, authPermission, asyncWrapper(alternativaController.atualizar.bind(alternativaController)))
  .delete("/alternativas/:id", AuthMiddleware, authPermission, asyncWrapper(alternativaController.deletar.bind(alternativaController)));

export default router;