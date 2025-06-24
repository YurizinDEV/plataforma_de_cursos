import Certificado from "../models/Certificado.js";
import CertificadoFilterBuilder from "./filters/CertificadoFilterBuilder.js";

class CertificadoRepository {
  constructor() {
    this.model = Certificado;
  }

  async criar(certificadoData) {
    return await this.model.create(certificadoData);
  }

  async buscarPorId(id) {
    return await this.model.findById(id).populate('usuarioId cursoId');
  }

  async listar(filters = {}) {
    const query = new CertificadoFilterBuilder()
      .porUsuarioId(filters.usuarioId)
      .porCursoId(filters.cursoId)
      .build();
    
    return await this.model.find(query).populate('usuarioId cursoId');
  }

  async verificarExistencia(usuarioId, cursoId) {
    return await this.model.findOne({ usuarioId, cursoId });
  }

  /**
   * Conta o número de certificados associados a um curso específico
   */
  async contarPorCursoId(cursoId) {
    return await this.model.countDocuments({ cursoId });
  }    /**
     * Delete todos os certificados associados a um curso específico
     * @param {string} cursoId - ID do curso
     * @param {Object} options - Opções como sessão de transação
     * @returns {Promise<number>} Número de certificados excluídos
     */
    async deletarPorCursoId(cursoId, options = {}) {
        const result = await this.model.deleteMany({ cursoId }, options);
        return result.deletedCount;
    }
}

export default CertificadoRepository;