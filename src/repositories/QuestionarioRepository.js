import Questionario from "../models/Questionario.js";
import QuestionarioFilterBuilder from "./filters/QuestionarioFilterBuilder.js";
import AlternativaRepository from './AlternativaRepository.js';
import {
  CustomError,
  HttpStatusCodes,
  messages
} from "../utils/helpers/index.js";

class QuestionarioRepository {
  constructor() {
    this.model = Questionario;
    this.alternativaRepository = new AlternativaRepository();
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
      dadosAtualizados, {
        new: true
      }
    ).populate('alternativas');
  }

  async deletar(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async adicionarAlternativa(questionarioId, alternativaId) {
    return await this.model.findByIdAndUpdate(
      questionarioId, {
        $push: {
          alternativas: alternativaId
        }
      }, {
        new: true
      }
    ).populate('alternativas');
  }

  async contarPorAulaIds(aulaIds) {
    return await this.model.countDocuments({
      aulaId: {
        $in: aulaIds
      }
    });
  }

  async buscarPorAulaIds(aulaIds) {
    return await this.model.find({
      aulaId: {
        $in: aulaIds
      }
    }).select('_id titulo');
  }

  async deletarPorAulaIds(aulaIds, options = {}) {
    const questionarios = await this.buscarPorAulaIds(aulaIds);
    const questionarioIds = questionarios.map(q => q._id);

    let alternativasExcluidas = 0;

    if (questionarioIds.length > 0) {
      alternativasExcluidas = await this.alternativaRepository.deletarPorQuestionarioIds(questionarioIds, options);
    }

    const result = await this.model.deleteMany({
      aulaId: {
        $in: aulaIds
      }
    }, options);

    return {
      questionariosExcluidos: result.deletedCount,
      alternativasExcluidas
    };
  }
}

export default QuestionarioRepository;