import CertificadoRepository from "../repositories/CertificadoRepository.js";
import UsuarioRepository from "../repositories/UsuarioRepository.js";
import CursoRepository from "../repositories/CursoRepository.js";
import { CustomError, messages, HttpStatusCodes } from "../utils/helpers/index.js";

class CertificadoService {
  constructor() {
    this.repository = CertificadoRepository;
    this.usuarioRepo = UsuarioRepository;
    this.cursoRepo = CursoRepository;
  }

  async criar(certificadoData) {
    // Verifica se usuário existe
    const usuario = await this.usuarioRepo.buscarPorId(certificadoData.usuarioId);
    if (!usuario) {
      throw new CustomError("Usuário não encontrado", HttpStatusCodes.NOT_FOUND);
    }

    // Verifica se curso existe
    const curso = await this.cursoRepo.buscarPorId(certificadoData.cursoId);
    if (!curso) {
      throw new CustomError("Curso não encontrado", HttpStatusCodes.NOT_FOUND);
    }

    // Verifica se certificado já existe
    const certificadoExistente = await this.repository.verificarExistencia(
      certificadoData.usuarioId,
      certificadoData.cursoId
    );
    if (certificadoExistente) {
      throw new CustomError("Certificado já emitido para este usuário e curso", HttpStatusCodes.CONFLICT);
    }

    return await this.repository.criar(certificadoData);
  }

  async buscarPorId(id) {
    const certificado = await this.repository.buscarPorId(id);
    if (!certificado) {
      throw new CustomError(messages.NOT_FOUND, HttpStatusCodes.NOT_FOUND);
    }
    return certificado;
  }

  async listar(filters) {
    return await this.repository.listar(filters);
  }

  async emitirParaUsuario(usuarioId, cursoId) {
    return await this.criar({
      usuarioId,
      cursoId,
      dataEmissao: new Date()
    });
  }
}

export default CertificadoService;