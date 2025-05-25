class AulaFilterBuilder {
    constructor() {
        this.filters = {};
    }

    porTitulo(titulo) {
        if (titulo) {
            this.filters.titulo = new RegExp(titulo, 'i');
        }
        return this;
    }

    porCursoId(cursoId) {
        if (cursoId) {
            this.filters.cursoId = cursoId;
        }
        return this;
    }

    porCriadorId(criadorId) {
        if (criadorId) {
            this.filters.criadoPorId = criadorId;
        }
        return this;
    }

    comCargaHorariaMinima(min) {
        if (min) {
            this.filters.cargaHoraria = { ...this.filters.cargaHoraria, $gte: min };
        }
        return this;
    }

    comCargaHorariaMaxima(max) {
        if (max) {
            this.filters.cargaHoraria = { ...this.filters.cargaHoraria, $lte: max };
        }
        return this;
    }

    comMaterialComplementar() {
        this.filters.materialComplementar = { $exists: true, $not: { $size: 0 } };
        return this;
    }

    build() {
        return this.filters;
    }
}

export default AulaFilterBuilder;