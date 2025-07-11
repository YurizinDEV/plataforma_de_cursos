import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
// Permissões não aplicadas nestas rotas para evitar dependência circular
import PermissionController from '../controllers/PermissionController.js';
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const permissionController = new PermissionController(); 

router
    // Rotas para gerenciar permissões dos grupos
    .get("/permissoes/rotas-disponiveis", AuthMiddleware, asyncWrapper(permissionController.listarRotasDisponiveis.bind(permissionController)))
    .get("/permissoes/grupos/:grupoId", AuthMiddleware, asyncWrapper(permissionController.obterPermissoesGrupo.bind(permissionController)))
    .post("/permissoes/grupos/:grupoId", AuthMiddleware, asyncWrapper(permissionController.adicionarPermissaoGrupo.bind(permissionController)))
    .put("/permissoes/grupos/:grupoId", AuthMiddleware, asyncWrapper(permissionController.configurarPermissoesGrupo.bind(permissionController)))
    .delete("/permissoes/grupos/:grupoId", AuthMiddleware, asyncWrapper(permissionController.removerPermissaoGrupo.bind(permissionController)))
    
    // Rota alternativa mais simples para configurar permissões
    .post("/permissions/configure", AuthMiddleware, asyncWrapper(permissionController.configurarPermissaoSimples.bind(permissionController)));

export default router;
