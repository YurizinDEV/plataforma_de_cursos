import Alternativa from "../models/Alternativa.js";
import AlternativaFilterBuilder from "./filters/AlternativaFilterBuilder.js";
import {
  CustomError,
  HttpStatusCodes,
  messages
} from "../utils/helpers/index.js";

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

  async atualizar(id, dadosAtualizados) {
    return await this.model.findByIdAndUpdate(id, dadosAtualizados, {
      new: true
    });
  }

  async deletar(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async deletarPorQuestionarioIds(questionarioIds, options = {}) {
    const result = await this.model.deleteMany({
      questionarioId: {
        $in: questionarioIds
      }
    }, options);

    return result.deletedCount;
  }

  async contarPorQuestionarioIds(questionarioIds) {
    return await this.model.countDocuments({
      questionarioId: {
        $in: questionarioIds
      }
    });
  }
}

export default AlternativaRepository;