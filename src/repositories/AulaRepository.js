import Aula from "../models/Aula.js";
import Curso from "../models/Curso.js";
import mongoose from "mongoose";
import AulaFilterBuilder from "./filters/AulaFilterBuilder.js";
import { CustomError, HttpStatusCodes, messages } from "../utils/helpers/index.js";

class AulaRepository {
    constructor() {
        this.model = Aula;
        this.cursoModel = Curso;
    }    async criar(aulaData) {
        const novaAula = new this.model(aulaData);
        const aulaSalva = await novaAula.save();
        
        // Atualiza a carga horária total do curso após criar a aula
        await this.atualizarCargaHorariaDoCurso(aulaData.cursoId);
        
        return aulaSalva;
    }

    async buscarPorId(id) {
        const aula = await this.model.findById(id);
        if (!aula) {
            throw new CustomError('Aula não encontrada', HttpStatusCodes.NOT_FOUND);
        }
        return aula;
    }

    async buscarPorTitulo(titulo, cursoId) {
        return await this.model.findOne({ titulo, cursoId });
    }

    async listar(filters = {}) {
        const query = new AulaFilterBuilder()
            .porTitulo(filters.titulo)
            .porCursoId(filters.cursoId)
            .build();

        return await Aula.find(query);
    }    async atualizar(id, dadosAtualizados) {
        // Obtém a aula atual para saber o cursoId
        const aulaAtual = await this.model.findById(id);
        
        if (!aulaAtual) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Aula',
                details: [],
                customMessage: messages.error.resourceNotFound('Aula')
            });
        }
            
        const aulaAtualizada = await Aula.findByIdAndUpdate(
            id,
            dadosAtualizados,
            { 
                new: true,
                runValidators: true
            }
        );
            
        // Atualiza a carga horária do curso usando o ID do curso da aula
        // Se o curso foi alterado, atualiza ambos os cursos
        if (dadosAtualizados.cursoId && dadosAtualizados.cursoId !== aulaAtual.cursoId.toString()) {
            // Se o curso foi alterado, atualize ambos os cursos
            await this.atualizarCargaHorariaDoCurso(aulaAtual.cursoId); // Curso antigo
            await this.atualizarCargaHorariaDoCurso(dadosAtualizados.cursoId); // Curso novo
        } else {
            // Se não alterou o curso, atualize apenas o curso atual
            await this.atualizarCargaHorariaDoCurso(aulaAtual.cursoId);
        }
            
        return aulaAtualizada;
    }    async deletar(id) {
        // Obtém a aula antes de deletá-la para saber o cursoId
        const aula = await this.model.findById(id);
        
        if (!aula) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Aula',
                details: [],
                customMessage: messages.error.resourceNotFound('Aula')
            });
        }
        
        // Armazenar o cursoId antes de excluir
        const cursoId = aula.cursoId;
        
        // Excluir a aula
        const aulaDeletada = await Aula.findByIdAndDelete(id);
        
        // Atualizar a carga horária total do curso
        await this.atualizarCargaHorariaDoCurso(cursoId);
        
        return aulaDeletada;
    }

    /**
     * Conta o número de aulas associadas a um curso específico
     */
    async contarPorCursoId(cursoId) {
        return await this.model.countDocuments({ cursoId });
    }    /**
     * Delete todas as aulas associadas a um curso específico
     */
    async deletarPorCursoId(cursoId, options = {}) {
        // Excluir as aulas
        const result = await this.model.deleteMany({ cursoId }, options);
        
        // Quando excluindo todas as aulas de um curso, definir carga horária como 0
        // Só faz isso se não estiver em uma transação controlada externamente
        if (!options.session) {
            await this.cursoModel.findByIdAndUpdate(cursoId, { cargaHorariaTotal: 0 });
        }
        
        return result.deletedCount;
    }/**
     * Obtém todas as aulas associadas a um curso específico
     */
    async buscarPorCursoId(cursoId) {
        return await this.model.find({ cursoId }).select('_id titulo duracao');
    }

    /**
     * Atualiza a carga horária total do curso com base em todas as aulas
     * @param {string} cursoId - ID do curso a ser atualizado
     * @returns {Promise<number>} - A nova carga horária total
     */
    async atualizarCargaHorariaDoCurso(cursoId) {
        // Busca todas as aulas do curso
        const aulas = await this.model.find({ cursoId });
        
        // Calcula a carga horária total
        const cargaHorariaTotal = aulas.reduce((total, aula) => total + (aula.cargaHoraria || 0), 0);
        
        // Atualiza o curso com a nova carga horária
        await this.cursoModel.findByIdAndUpdate(cursoId, {
            cargaHorariaTotal: cargaHorariaTotal
        });
        
        return cargaHorariaTotal;
    }
}

export default AulaRepository;