// src/controllers/CertificadoController.js
import CertificadoService from '../services/CertificadoService.js'; // Certifique-se de criar este serviço

class CertificadoController {
    async emitirCertificado(req, res) {
        const { id } = req.params;
        try {
            const certificado = await CertificadoService.getCertificado(id, req.user);
            res.status(200).json(certificado);
        } catch (err) {
            res.status(400).json({ error: 'Requisitos não atendidos para emissão do certificado.' });
        }
    }
}

export default CertificadoController;