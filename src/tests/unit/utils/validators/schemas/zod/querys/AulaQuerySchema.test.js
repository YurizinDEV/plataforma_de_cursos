// src/tests/unit/schemas/zod/querys/AulaQuerySchema.test.js
import { AulaQuerySchema, AulaIdSchema } from '../../../../../src/utils/validators/schemas/zod/querys/AulaQuerySchema.js';
import { describe, it, expect } from '@jest/globals';

describe('AulaQuerySchema', () => {
  it('valida com valores corretos', async () => {
    const data = {
      titulo: "teste",
      cursoId: "507f191e810c19729de860ea",
      page: "1",
      limit: "10"
    };
    const parsed = await AulaQuerySchema.parseAsync(data);
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(10);
  });

  it('rejeita ID inválido', async () => {
    await expect(
      AulaQuerySchema.parseAsync({ cursoId: "abc", page: "1", limit: "10" })
    ).rejects.toThrow("ID inválido");
  });

  it('valida AulaIdSchema corretamente', () => {
    expect(() => AulaIdSchema.parse("invalid")).toThrow("ID da aula inválido");
  });
});
