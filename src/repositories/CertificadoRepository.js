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

  async listarPaginado({ page = 1, limit = 10, ...filters }) {
    const query = new CertificadoFilterBuilder()
      .porUsuarioId(filters.usuarioId)
      .porCursoId(filters.cursoId)
      .build();

    return await this.model.paginate(query, {
      page,
      limit,
      sort: { dataEmissao: -1 },
      populate: ['usuarioId', 'cursoId']
    });
  }

  async verificarExistencia(usuarioId, cursoId) {
    return await this.model.findOne({ usuarioId, cursoId });
  }
}

export default new CertificadoRepository();