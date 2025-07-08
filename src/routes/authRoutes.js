import express from "express";
import AuthController from '../controllers/AuthController.js';
import UsuarioController from "../controllers/UsuarioController.js";
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();

const authController = new AuthController();
const usuarioController = new UsuarioController();

router
    .post("/login", asyncWrapper(authController.login.bind(authController)))
    .post("/recover", asyncWrapper(authController.recuperaSenha.bind(authController)))
    .post("/reset-password", asyncWrapper(authController.atualizarSenhaToken.bind(authController))) // Redefinir senha via token
    .post("/reset-password-code", asyncWrapper(authController.atualizarSenhaCodigo.bind(authController))) // Redefinir senha via código
    .post("/signup", asyncWrapper(usuarioController.criarComSenha.bind(usuarioController)))
    .post("/logout", asyncWrapper(authController.logout.bind(authController)))
    .post("/revoke", asyncWrapper(authController.revoke.bind(authController)))
    .post("/refresh", asyncWrapper(authController.refresh.bind(authController)))
    .post("/introspect", asyncWrapper(authController.pass.bind(authController))) // Checa se o token é válido

export default router;
