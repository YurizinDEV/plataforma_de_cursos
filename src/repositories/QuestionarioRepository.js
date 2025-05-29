import Questionario from "../models/Questionario.js";
import QuestionarioFilterBuilder from "./filters/QuestionarioFilterBuilder.js";

class QuestionarioRepository {
  constructor() {
    this.model = Questionario;
  }

  async criar(questionarioData) {
    return await this.model.create(questionarioData);
  }

  async buscarPorId(id) {
    return await this.model.findById(id).populate('alternativas');
  }

  async listar(filters = {}) {
    const query = new QuestionarioFilterBuilder()
      .porAulaId(filters.aulaId)
      .build();

    return await this.model.find(query).populate('alternativas');
  }

  async atualizar(id, dadosAtualizados) {
    return await this.model.findByIdAndUpdate(
      id, 
      dadosAtualizados, 
      { new: true }
    ).populate('alternativas');
  }

  async deletar(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async adicionarAlternativa(questionarioId, alternativaId) {
    return await this.model.findByIdAndUpdate(
      questionarioId,
      { $push: { alternativas: alternativaId } },
      { new: true }
    ).populate('alternativas');
  }
}

export default QuestionarioRepository;