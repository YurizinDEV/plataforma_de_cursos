import express from "express";
import CertificadoController from '../controllers/CertificadoController.js'; // Controller para emissão de certificados
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const certificadoController = new CertificadoController();

router.get("/certificado/:id", asyncWrapper(certificadoController.emitirCertificado.bind(certificadoController)));

export default router;