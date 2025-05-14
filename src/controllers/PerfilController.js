// src/controllers/PerfilController.js
import PerfilService from '../services/PerfilService.js'; // Certifique-se de criar este serviço

class PerfilController {
    async visualizarPerfil(req, res) {
        const userId = req.user.id; // Obtendo o ID do usuário autenticado
        try {
            const perfilData = await PerfilService.getPerfil(userId);
            res.status(200).json(perfilData);
        } catch (err) {
            res.status(403).json({ error: 'Acesso não autorizado.' });
        }
    }

    async atualizarPerfil(req, res) {
        const userId = req.user.id;
        try {
            const updatedData = await PerfilService.updatePerfil(userId, req.body);
            res.status(200).json(updatedData);
        } catch (err) {
            res.status(400).json({ error: err.message }); // Mensagem de erro de validação
        }
    }
}

export default PerfilController;