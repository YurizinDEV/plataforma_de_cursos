// src/repositories/filters/CursoFilterBuilder.js

import CursoModel from '../../models/Curso.js';

class CursoFilterBuilder {
    constructor() {
        this.filtros = {};
        this.cursoModel = CursoModel;
    }
    comTitulo(titulo) {
        if (titulo && titulo.trim() !== '') {
            this.filtros.titulo = {
                $regex: titulo,
                $options: 'i'
            };
        }
        return this;
    }

    comTags(tags) {
        // Verifica se tags existe e se tem elementos (não é um array vazio)
        if (tags && (Array.isArray(tags) ? tags.length > 0 : true)) {
            const tagsArray = Array.isArray(tags) ? tags : [tags];
            // Filtra para remover strings vazias
            const filteredTags = tagsArray.filter(tag => tag && tag.trim() !== '');
            if (filteredTags.length > 0) {
                this.filtros.tags = {
                    $in: filteredTags
                };
            }
        }
        return this;
    }

    comProfessores(professores) {
        // Verifica se professores existe e se tem elementos (não é um array vazio)
        if (professores && (Array.isArray(professores) ? professores.length > 0 : true)) {
            const professoresArray = Array.isArray(professores) ? professores : [professores];
            // Filtra para remover strings vazias
            const filteredProfessores = professoresArray.filter(prof => prof && prof.trim() !== '');
            if (filteredProfessores.length > 0) {
                this.filtros.professores = {
                    $in: filteredProfessores
                };
            }
        }
        return this;
    }
    comCargaHoraria(min, max) {
        // Verifica se pelo menos um dos valores é válido
        const minValid = min && !isNaN(parseInt(min));
        const maxValid = max && !isNaN(parseInt(max));

        if (minValid || maxValid) {
            this.filtros.cargaHorariaTotal = {};

            if (minValid) {
                this.filtros.cargaHorariaTotal.$gte = parseInt(min);
            }

            if (maxValid) {
                this.filtros.cargaHorariaTotal.$lte = parseInt(max);
            }
        }
        return this;
    }

    comCriadoPor(usuarioId) {
        if (usuarioId && usuarioId.trim() !== '') {
            this.filtros.criadoPorId = usuarioId;
        }
        return this;
    }

    escapeRegex(texto) {
        return texto.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }

    build() {
        return this.filtros;
    }
}

export default CursoFilterBuilder;