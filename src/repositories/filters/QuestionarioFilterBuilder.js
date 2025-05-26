class QuestionarioFilterBuilder {
  constructor() {
    this.filters = {};
  }

  porAulaId(aulaId) {
    if (aulaId) {
      this.filters.aulaId = aulaId;
    }
    return this;
  }

  build() {
    return this.filters;
  }
}

export default QuestionarioFilterBuilder;