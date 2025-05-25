class AlternativaFilterBuilder {
  constructor() {
    this.filters = {};
  }

  porQuestionarioId(questionarioId) {
    if (questionarioId) {
      this.filters.questionarioId = questionarioId;
    }
    return this;
  }

  build() {
    return this.filters;
  }
}

export default AlternativaFilterBuilder;