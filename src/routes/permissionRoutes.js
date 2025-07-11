import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import PermissionController from '../controllers/PermissionController.js';
import {
    asyncWrapper
} from '../utils/helpers/index.js';

const router = express.Router();
const permissionController = new PermissionController();

router
    .get("/permissoes/rotas-disponiveis", AuthMiddleware, asyncWrapper(permissionController.listarRotasDisponiveis.bind(permissionController)))
    .get("/permissoes/grupos/:grupoId", AuthMiddleware, asyncWrapper(permissionController.obterPermissoesGrupo.bind(permissionController)))
    .post("/permissoes/grupos/:grupoId", AuthMiddleware, asyncWrapper(permissionController.adicionarPermissaoGrupo.bind(permissionController)))
    .post("/permissions/configure", AuthMiddleware, asyncWrapper(permissionController.configurarPermissaoSimples.bind(permissionController)))
    .put("/permissoes/grupos/:grupoId", AuthMiddleware, asyncWrapper(permissionController.configurarPermissoesGrupo.bind(permissionController)))
    .delete("/permissoes/grupos/:grupoId", AuthMiddleware, asyncWrapper(permissionController.removerPermissaoGrupo.bind(permissionController)));

export default router;