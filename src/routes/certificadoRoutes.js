import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import authPermission from '../middlewares/AuthPermission.js';
import CertificadoController from "../controllers/CertificadoController.js";
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const certificadoController = new CertificadoController();

router
  .get("/certificados", AuthMiddleware, authPermission, asyncWrapper(certificadoController.listar.bind(certificadoController)))
  .get("/certificados/:id", AuthMiddleware, authPermission, asyncWrapper(certificadoController.buscar.bind(certificadoController)))
  .post("/certificados", AuthMiddleware, authPermission, asyncWrapper(certificadoController.criar.bind(certificadoController)))
  .post("/certificados/emitir/:usuarioId/:cursoId", AuthMiddleware, authPermission,
    asyncWrapper(certificadoController.emitirParaUsuario.bind(certificadoController)));

export default router;