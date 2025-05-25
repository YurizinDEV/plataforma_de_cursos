import express from "express";
import AlternativaController from "../controllers/AlternativaController.js";
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const alternativaController = new AlternativaController();

router
  .get("/alternativas", asyncWrapper(alternativaController.listar.bind(alternativaController)))
  .get("/alternativas/paginado", asyncWrapper(alternativaController.listarPaginado.bind(alternativaController)))
  .get("/alternativas/:id", asyncWrapper(alternativaController.buscar.bind(alternativaController)))
  .post("/alternativas", asyncWrapper(alternativaController.criar.bind(alternativaController)))
  .put("/alternativas/:id", asyncWrapper(alternativaController.atualizar.bind(alternativaController)))
  .delete("/alternativas/:id", asyncWrapper(alternativaController.deletar.bind(alternativaController)));

export default router;