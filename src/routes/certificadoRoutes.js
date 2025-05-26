import express from "express";
import CertificadoController from "../controllers/CertificadoController.js";
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const certificadoController = new CertificadoController();

router
  .get("/certificados", asyncWrapper(certificadoController.listar.bind(certificadoController)))
  .get("/certificados/paginado", asyncWrapper(certificadoController.listarPaginado.bind(certificadoController)))
  .get("/certificados/:id", asyncWrapper(certificadoController.buscar.bind(certificadoController)))
  .post("/certificados", asyncWrapper(certificadoController.criar.bind(certificadoController)))
  .post("/certificados/emitir/:usuarioId/:cursoId", 
    asyncWrapper(certificadoController.emitirParaUsuario.bind(certificadoController)));

export default router;