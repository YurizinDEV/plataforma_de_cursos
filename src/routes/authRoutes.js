import express from "express";
import AuthController from '../controllers/AuthController.js'; // Controller para tratar autenticação
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const authController = new AuthController();

router.post("/login", asyncWrapper(authController.login.bind(authController)));

export default router;