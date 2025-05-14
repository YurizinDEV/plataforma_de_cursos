// src/controllers/AuthController.js
import UserService from '../services/UserService.js'; // Certifique-se de criar este serviço

class AuthController {
    async login(req, res) {
        const { email, password } = req.body;
        try {
            const { token, userType } = await UserService.authenticateUser(email, password);
            res.status(200).json({ token, userType });
        } catch (err) {
            res.status(401).json({ error: err.message }); // Mensagem de erro personalizada
        }
    }
}

export default AuthController;