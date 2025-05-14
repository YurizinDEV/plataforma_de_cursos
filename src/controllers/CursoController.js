// src/controllers/CursoController.js
import CursoService from '../services/CursoService.js'; // Certifique-se de criar este serviço

class CursoController {
    async listarCursos(req, res) {
        try {
            const cursos = await CursoService.getAllCursos(req.user);
            res.status(200).json(cursos);
        } catch (err) {
            res.status(500).json({ error: 'Erro ao listar cursos.' });
        }
    }

    async visualizarCurso(req, res) {
        const { id } = req.params;
        try {
            const cursoDetails = await CursoService.getCursoById(id, req.user);
            res.status(200).json(cursoDetails);
        } catch (err) {
            res.status(403).json({ error: 'Acesso não autorizado.' });
        }
    }

    async matricularAluno(req, res) {
        const { id } = req.params;
        const userId = req.user.id;
        try {
            const matricula = await CursoService.matricularUsuario(userId, id);
            res.status(201).json({ message: 'Matrícula realizada com sucesso!', matricula });
        } catch (err) {
            res.status(400).json({ error: err.message }); // Mensagem de erro personalizada
        }
    }
}

export default CursoController;