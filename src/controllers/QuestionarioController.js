// src/controllers/QuestionarioController.js
import QuestionarioService from '../services/QuestionarioService.js'; // Certifique-se de criar este serviço

class QuestionarioController {
    async carregarQuestionario(req, res) {
        const { id } = req.params;
        try {
            const questionario = await QuestionarioService.getQuestionarioById(id, req.user);
            res.status(200).json(questionario);
        } catch (err) {
            res.status(403).json({ error: 'Acesso não autorizado.' });
        }
    }

    async submeterQuestionario(req, res) {
        const { id } = req.params;
        const respostas = req.body;
        try {
            const resultado = await QuestionarioService.submeterRespostas(id, respostas, req.user);
            res.status(200).json(resultado);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}

export default QuestionarioController;