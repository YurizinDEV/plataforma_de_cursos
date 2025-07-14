// src/tests/unit/repositories/filters/AulaFilterBuilder.test.js
import AulaFilterBuilder from '../../../../src/repositories/filters/AulaFilterBuilder.js';

describe('AulaFilterBuilder', () => {
  it('build() retorna filtros corretamente', () => {
    const builder = new AulaFilterBuilder()
      .porTitulo('React')
      .porCursoId('curso123')
      .porCriadorId('user456')
      .comCargaHorariaMinima(1)
      .comCargaHorariaMaxima(5)
      .comMaterialComplementar();

    const filtros = builder.build();
    expect(filtros.titulo).toBeInstanceOf(RegExp);
    expect(filtros.cursoId).toBe('curso123');
    expect(filtros.criadoPorId).toBe('user456');
    expect(filtros.materialComplementar).toBeDefined();
  });
});
