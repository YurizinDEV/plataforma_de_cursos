// src/tests/unit/schemas/zod/AulaSchema.test.js
import { AulaSchema, AulaUpdateSchema } from '../../../../src/utils/validators/schemas/zod/AulaSchema.js';
import { describe, it, expect } from '@jest/globals';

describe('AulaSchema', () => {
  const valid = {
    titulo: "Aula de Teste",
    conteudoURL: "https://exemplo.com",
    cargaHoraria: 2,
    cursoId: "507f191e810c19729de860ea",
    criadoPorId: "507f191e810c19729de860eb"
  };

  it('deve validar um schema completo', () => {
    const parsed = AulaSchema.parse(valid);
    expect(parsed.titulo).toBe(valid.titulo);
  });

  it('deve rejeitar URL inválida', () => {
    expect(() =>
      AulaSchema.parse({ ...valid, conteudoURL: "invalid-url" })
    ).toThrow();
  });

  it('UpdateSchema aceita parcial', () => {
    const partial = AulaUpdateSchema.parse({ titulo: "Atualizada" });
    expect(partial).toHaveProperty("titulo");
  });
});
