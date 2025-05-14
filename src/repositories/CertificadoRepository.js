// src/repositories/CertificadoRepository.js

class CertificadoRepository {
    async getCertificado(userId, cursoId) {
        // Implementar a lógica para verificar se o usuário concluiu o curso e retornar o certificado
        const [certificado] = await db('certificados').where({ user_id: userId, course_id: cursoId });
        if (!certificado) throw new Error('Certificado não encontrado ou requisitos não atendidos.');
        return certificado;
    }
}

export default new CertificadoRepository();