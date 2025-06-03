import AulaFilterBuilder from '../../../../repositories/filters/AulaFilterBuilder.js';

describe('AulaFilterBuilder', () => {
  let builder;

  beforeEach(() => {
    builder = new AulaFilterBuilder();
  });

  test('deve retornar filtro vazio quando não aplicado nenhum filtro', () => {
    expect(builder.build()).toEqual({});
  });

  test('deve filtrar por título', () => {
    builder.porTitulo('Node.js');
    expect(builder.build()).toEqual({
      titulo: /Node.js/i
    });
  });

  test('não deve adicionar filtro de título quando não fornecido', () => {
    builder.porTitulo();
    expect(builder.build()).toEqual({});
  });

  test('deve filtrar por cursoId', () => {
    const cursoId = '507f1f77bcf86cd799439011';
    builder.porCursoId(cursoId);
    expect(builder.build()).toEqual({
      cursoId
    });
  });

  test('não deve adicionar filtro de cursoId quando não fornecido', () => {
    builder.porCursoId();
    expect(builder.build()).toEqual({});
  });

  test('deve filtrar por criadorId', () => {
    const criadorId = '507f191e810c19729de860ea';
    builder.porCriadorId(criadorId);
    expect(builder.build()).toEqual({
      criadoPorId: criadorId
    });
  });

  test('deve filtrar por carga horária mínima', () => {
    builder.comCargaHorariaMinima(2);
    expect(builder.build()).toEqual({
      cargaHoraria: { $gte: 2 }
    });
  });

  test('deve filtrar por carga horária máxima', () => {
    builder.comCargaHorariaMaxima(4);
    expect(builder.build()).toEqual({
      cargaHoraria: { $lte: 4 }
    });
  });

  test('deve combinar carga horária mínima e máxima', () => {
    builder
      .comCargaHorariaMinima(2)
      .comCargaHorariaMaxima(4);
    
    expect(builder.build()).toEqual({
      cargaHoraria: { $gte: 2, $lte: 4 }
    });
  });

  test('deve construir filtro com título', () => {
    const filtro = new AulaFilterBuilder().porTitulo('React').build();
    expect(filtro).toEqual({ titulo: /React/i });
  });

  test('deve construir filtro com cursoId e criadorId', () => {
    const filtro = new AulaFilterBuilder()
      .porCursoId('curso123')
      .porCriadorId('criador456')
      .build();
    expect(filtro).toEqual({ cursoId: 'curso123', criadoPorId: 'criador456' });
  });

  test('deve construir filtro com carga horária mínima', () => {
    const filtro = new AulaFilterBuilder()
      .comCargaHorariaMinima(10)
      .build();
    expect(filtro).toEqual({ cargaHoraria: { $gte: 10 } });
  });

  test('deve construir filtro com carga horária máxima', () => {
    const filtro = new AulaFilterBuilder()
      .comCargaHorariaMaxima(20)
      .build();
    expect(filtro).toEqual({ cargaHoraria: { $lte: 20 } });
  });

  test('deve construir filtro com material complementar', () => {
    const filtro = new AulaFilterBuilder()
      .comMaterialComplementar()
      .build();
    expect(filtro).toEqual({
      materialComplementar: { $exists: true, $not: { $size: 0 } }
    });
  });

  test('deve construir filtro com múltiplos critérios', () => {
    const filtro = new AulaFilterBuilder()
      .porTitulo('JS')
      .porCursoId('curso1')
      .porCriadorId('user1')
      .comCargaHorariaMinima(5)
      .comCargaHorariaMaxima(15)
      .comMaterialComplementar()
      .build();

    expect(filtro).toEqual({
      titulo: /JS/i,
      cursoId: 'curso1',
      criadoPorId: 'user1',
      cargaHoraria: { $gte: 5, $lte: 15 },
      materialComplementar: { $exists: true, $not: { $size: 0 } }
    });
  });

  test('deve filtrar por material complementar', () => {
    builder.comMaterialComplementar();
    expect(builder.build()).toEqual({
      materialComplementar: { $exists: true, $not: { $size: 0 } }
    });
  });

  test('deve combinar múltiplos filtros', () => {
    builder
      .porTitulo('Node')
      .porCursoId('507f1f77bcf86cd799439011')
      .comCargaHorariaMinima(2)
      .comCargaHorariaMaxima(4);

    expect(builder.build()).toEqual({
      titulo: /Node/i,
      cursoId: '507f1f77bcf86cd799439011',
      cargaHoraria: { $gte: 2, $lte: 4 }
    });
  });
});