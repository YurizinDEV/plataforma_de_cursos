import Aula from "../models/Aula.js";
import Curso from "../models/Curso.js";
import mongoose from "mongoose";
import AulaFilterBuilder from "./filters/AulaFilterBuilder.js";
import {
    CustomError,
    HttpStatusCodes,
    messages
} from "../utils/helpers/index.js";

class AulaRepository {
    constructor() {
        this.model = Aula;
        this.cursoModel = Curso;
    }
    async criar(aulaData) {
        const novaAula = new this.model(aulaData);
        const aulaSalva = await novaAula.save();

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
        return await this.model.findOne({
            titulo,
            cursoId
        });
    }

    async listar(filters = {}) {
        const query = new AulaFilterBuilder()
            .porTitulo(filters.titulo)
            .porCursoId(filters.cursoId)
            .build();

        return await Aula.find(query);
    }
    async atualizar(id, dadosAtualizados) {
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
            dadosAtualizados, {
                new: true,
                runValidators: true
            }
        );

        if (dadosAtualizados.cursoId && dadosAtualizados.cursoId !== aulaAtual.cursoId.toString()) {
            await this.atualizarCargaHorariaDoCurso(aulaAtual.cursoId);
            await this.atualizarCargaHorariaDoCurso(dadosAtualizados.cursoId);
        } else {
            await this.atualizarCargaHorariaDoCurso(aulaAtual.cursoId);
        }

        return aulaAtualizada;
    }
    async deletar(id) {
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

        const cursoId = aula.cursoId;

        const aulaDeletada = await Aula.findByIdAndDelete(id);

        await this.atualizarCargaHorariaDoCurso(cursoId);

        return aulaDeletada;
    }

    async contarPorCursoId(cursoId) {
        return await this.model.countDocuments({
            cursoId
        });
    }

    async deletarPorCursoId(cursoId, options = {}) {
        const result = await this.model.deleteMany({
            cursoId
        }, options);

        if (!options.session) {
            await this.cursoModel.findByIdAndUpdate(cursoId, {
                cargaHorariaTotal: 0
            });
        }

        return result.deletedCount;
    }

    async buscarPorCursoId(cursoId) {
        return await this.model.find({
            cursoId
        }).select('_id titulo duracao');
    }

    async atualizarCargaHorariaDoCurso(cursoId) {
        const aulas = await this.model.find({
            cursoId
        });

        const cargaHorariaTotal = aulas.reduce((total, aula) => total + (aula.cargaHoraria || 0), 0);

        await this.cursoModel.findByIdAndUpdate(cursoId, {
            cargaHorariaTotal: cargaHorariaTotal
        });

        return cargaHorariaTotal;
    }
}

export default AulaRepository;