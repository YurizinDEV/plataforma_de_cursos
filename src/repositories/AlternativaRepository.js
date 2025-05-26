import Alternativa from "../models/Alternativa.js";
import AlternativaFilterBuilder from "./filters/AlternativaFilterBuilder.js";

class AlternativaRepository {
  constructor() {
    this.model = Alternativa;
  }

  async criar(alternativaData) {
    return await this.model.create(alternativaData);
  }

  async buscarPorId(id) {
    return await this.model.findById(id);
  }

  async listar(filters = {}) {
    const query = new AlternativaFilterBuilder()
      .porQuestionarioId(filters.questionarioId)
      .build();
    
    return await this.model.find(query);
  }

  async listarPaginado({ page = 1, limit = 10, ...filters }) {
    const query = new AlternativaFilterBuilder()
      .porQuestionarioId(filters.questionarioId)
      .build();

    return await this.model.paginate(query, {
      page,
      limit,
      sort: { numeroResposta: 1 }
    });
  }

  async atualizar(id, dadosAtualizados) {
    return await this.model.findByIdAndUpdate(id, dadosAtualizados, { new: true });
  }

  async deletar(id) {
    return await this.model.findByIdAndDelete(id);
  }
}

export default new AlternativaRepository();