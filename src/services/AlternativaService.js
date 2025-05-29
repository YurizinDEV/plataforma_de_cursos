import AlternativaRepository from "../repositories/AlternativaRepository.js";
import QuestionarioRepository from "../repositories/QuestionarioRepository.js";
import { CustomError, messages, HttpStatusCodes } from "../utils/helpers/index.js";

class AlternativaService {
  constructor() {
    this.repository = AlternativaRepository;
    this.questionarioRepo = QuestionarioRepository;
  }

  async criar(alternativaData) {
    const questionario = await this.questionarioRepo.buscarPorId(alternativaData.questionarioId);
    if (!questionario) {
      throw new CustomError(messages.NOT_FOUND, HttpStatusCodes.NOT_FOUND);
    }

    return await this.repository.criar(alternativaData);
  }

  async buscarPorId(id) {
    const alternativa = await this.repository.buscarPorId(id);
    if (!alternativa) {
      throw new CustomError(messages.NOT_FOUND, HttpStatusCodes.NOT_FOUND);
    }
    return alternativa;
  }

  async listar(filters) {
    return await this.repository.listar(filters);
  }

  async atualizar(id, dadosAtualizados) {
    const alternativa = await this.buscarPorId(id);
    return await this.repository.atualizar(id, dadosAtualizados);
  }

  async deletar(id) {
    await this.buscarPorId(id);
    return await this.repository.deletar(id);
  }
}

export default AlternativaService;