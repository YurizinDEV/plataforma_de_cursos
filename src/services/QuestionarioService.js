import QuestionarioRepository from "../repositories/QuestionarioRepository.js";
import AulaRepository from "../repositories/AulaRepository.js";
import AlternativaRepository from "../repositories/AlternativaRepository.js";
import { CustomError, messages, HttpStatusCodes } from "../utils/helpers/index.js";

class QuestionarioService {
  constructor() {
  this.repository = new QuestionarioRepository();
  this.aulaRepo = new AulaRepository();
  this.alternativaRepo = new AlternativaRepository();
}

  async criar(questionarioData) {
    const aula = await this.aulaRepo.buscarPorId(questionarioData.aulaId);
    if (!aula) {
      throw new CustomError("Aula não encontrada", HttpStatusCodes.NOT_FOUND);
    }

    if (questionarioData.numeroRespostaCorreta < 0 || questionarioData.numeroRespostaCorreta > 3) {
      throw new CustomError("Número da resposta correta inválido", HttpStatusCodes.BAD_REQUEST);
    }

    return await this.repository.criar(questionarioData);
  }

  async buscarPorId(id) {
    const questionario = await this.repository.buscarPorId(id);
    if (!questionario) {
      throw new CustomError(messages.NOT_FOUND, HttpStatusCodes.NOT_FOUND);
    }
    return questionario;
  }

  async listar(filters) {
    return await this.repository.listar(filters);
  }

  async atualizar(id, dadosAtualizados) {
    await this.buscarPorId(id);
    return await this.repository.atualizar(id, dadosAtualizados);
  }

  async deletar(id) {
    const questionario = await this.buscarPorId(id);
    
    // Remove as alternativas associadas
    await this.alternativaRepo.model.deleteMany({
      _id: { $in: questionario.alternativas }
    });

    return await this.repository.deletar(id);
  }

  async adicionarAlternativa(questionarioId, alternativaId) {
    const questionario = await this.buscarPorId(questionarioId);
    const alternativa = await this.alternativaRepo.buscarPorId(alternativaId);
    
    if (!alternativa) {
      throw new CustomError("Alternativa não encontrada", HttpStatusCodes.NOT_FOUND);
    }

    return await this.repository.adicionarAlternativa(questionarioId, alternativaId);
  }
}

export default QuestionarioService;