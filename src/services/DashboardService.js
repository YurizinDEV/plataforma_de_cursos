// src/services/DashboardService.js
import DashboardRepository from '../repositories/DashboardRepository.js';

class DashboardService {
    async getDashboardData(userId) {
        return await DashboardRepository.getDashboardData(userId);
    }
}

export default new DashboardService();