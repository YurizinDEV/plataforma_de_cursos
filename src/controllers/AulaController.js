// src/controllers/AulaController.js
import AulaService from '../services/AulaService.js'; // Certifique-se de criar este serviço

class AulaController {
    async acessarAula(req, res) {
        const { id } = req.params;
        try {
            const aulaContent = await AulaService.getAulaContent(id, req.user);
            res.status(200).json(aulaContent);
        } catch (err) {
            res.status(403).json({ error: 'Acesso não autorizado.' });
        }
    }
}

export default AulaController;