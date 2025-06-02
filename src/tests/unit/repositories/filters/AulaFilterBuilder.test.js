import AulaFilterBuilder from '../../../../repositories/filters/AulaFilterBuilder.js';

describe('AulaFilterBuilder', () => {
    let builder;

    beforeEach(() => {
        builder = new AulaFilterBuilder();
    });

    test('deve filtrar por título', () => {
        builder.porTitulo('Node.js');
        expect(builder.build()).toEqual({
            titulo: /Node.js/i
        });
    });

    test('deve filtrar por cursoId', () => {
        const cursoId = '507f1f77bcf86cd799439011';
        builder.porCursoId(cursoId);
        expect(builder.build()).toEqual({
            cursoId
        });
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