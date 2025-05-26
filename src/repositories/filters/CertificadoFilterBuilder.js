class CertificadoFilterBuilder {
  constructor() {
    this.filters = {};
  }

  porUsuarioId(usuarioId) {
    if (usuarioId) {
      this.filters.usuarioId = usuarioId;
    }
    return this;
  }

  porCursoId(cursoId) {
    if (cursoId) {
      this.filters.cursoId = cursoId;
    }
    return this;
  }

  build() {
    return this.filters;
  }
}

export default CertificadoFilterBuilder;