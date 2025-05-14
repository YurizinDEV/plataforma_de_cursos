// src/controllers/DashboardController.js
import DashboardService from '../services/DashboardService.js'; // Certifique-se de criar este serviço

class DashboardController {
    async exibirDashboard(req, res) {
        const userId = req.user.id; // Supondo que a informação do usuário é armazenada no req.user após autenticação
        try {
            const dashboardData = await DashboardService.getDashboardData(userId);
            res.status(200).json(dashboardData);
        } catch (err) {
            res.status(500).json({ error: 'Erro ao obter dados do dashboard.' });
        }
    }
}

export default DashboardController;