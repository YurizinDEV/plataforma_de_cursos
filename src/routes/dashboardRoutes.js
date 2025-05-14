import express from "express";
import DashboardController from '../controllers/DashboardController.js'; // Controller para o dashboard
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();
const dashboardController = new DashboardController();

router.get("/home", asyncWrapper(dashboardController.exibirDashboard.bind(dashboardController)));

export default router;