import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { AulaQuerySchema, AulaIdSchema } from '../../../../../../../utils/validators/schemas/zod/querys/AulaQuerySchema.js';

describe('AulaQuerySchema', () => {
  describe('Validações de campo', () => {
    it('deve aceitar query vazia', async () => {
      const resultado = await AulaQuerySchema.parseAsync({});
      expect(resultado).toBeDefined();
    });

    describe('Campo titulo', () => {
      it('deve validar titulo corretamente', async () => {
        const resultado = await AulaQuerySchema.parseAsync({
          titulo: 'JavaScript'
        });
        expect(resultado.titulo).toBe('JavaScript');
      });

      it('deve fazer trim do titulo', async () => {
        const resultado = await AulaQuerySchema.parseAsync({
          titulo: '  JavaScript  '
        });
        expect(resultado.titulo).toBe('JavaScript');
      });
    });

    describe('Campo cursoId', () => {
      it('deve validar cursoId corretamente', async () => {
        const id = new mongoose.Types.ObjectId().toString();
        const resultado = await AulaQuerySchema.parseAsync({
          cursoId: id
        });
        expect(resultado.cursoId).toBe(id);
      });

      it('deve rejeitar cursoId inválido', async () => {
        await expect(AulaQuerySchema.parseAsync({
          cursoId: 'id-invalido'
        })).rejects.toThrow(/ID inválido/);
      });
    });

    describe('Campo page', () => {
      it('deve validar page corretamente', async () => {
        const resultado = await AulaQuerySchema.parseAsync({
          page: '2'
        });
        expect(resultado.page).toBe(2);
      });

      it('deve usar valor padrão 1 quando page não é fornecido', async () => {
        const resultado = await AulaQuerySchema.parseAsync({});
        expect(resultado.page).toBe(1);
      });

      it('deve rejeitar valores não numéricos para page', async () => {
        await expect(AulaQuerySchema.parseAsync({
          page: 'abc'
        })).rejects.toThrow(/Número/);
      });

      it('deve rejeitar números menores que 1 para page', async () => {
        await expect(AulaQuerySchema.parseAsync({
          page: '0'
        })).rejects.toThrow(/mínimo 1/);
      });
    });

    describe('Campo limit', () => {
      it('deve validar limit corretamente', async () => {
        const resultado = await AulaQuerySchema.parseAsync({
          limit: '20'
        });
        expect(resultado.limit).toBe(20);
      });

      it('deve usar valor padrão 10 quando limit não é fornecido', async () => {
        const resultado = await AulaQuerySchema.parseAsync({});
        expect(resultado.limit).toBe(10);
      });

      it('deve rejeitar valores não numéricos para limit', async () => {
        await expect(AulaQuerySchema.parseAsync({
          limit: 'abc'
        })).rejects.toThrow(/Número/);
      });

      it('deve rejeitar números menores que 1 para limit', async () => {
        await expect(AulaQuerySchema.parseAsync({
          limit: '0'
        })).rejects.toThrow(/mínimo 1/);
      });

      it('deve rejeitar números maiores que 100 para limit', async () => {
        await expect(AulaQuerySchema.parseAsync({
          limit: '101'
        })).rejects.toThrow(/máximo 100/);
      });
    });
  });

  describe('Validações de múltiplos campos', () => {
    it('deve aceitar múltiplos campos válidos', async () => {
      const cursoId = new mongoose.Types.ObjectId().toString();
      const query = {
        titulo: 'JavaScript',
        cursoId: cursoId,
        page: '2',
        limit: '50'
      };

      const resultado = await AulaQuerySchema.parseAsync(query);
      expect(resultado.titulo).toBe('JavaScript');
      expect(resultado.cursoId).toBe(cursoId);
      expect(resultado.page).toBe(2);
      expect(resultado.limit).toBe(50);
    });

    it('deve rejeitar quando um dos campos é inválido', async () => {
      const query = {
        titulo: 'JavaScript',
        cursoId: 'id-invalido'
      };

      await expect(AulaQuerySchema.parseAsync(query)).rejects.toThrow();
    });
  });

  describe('AulaIdSchema', () => {
    it('deve validar um ID válido de MongoDB', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      const resultado = await AulaIdSchema.parseAsync(id);
      expect(resultado).toBe(id);
    });

    it('deve rejeitar IDs inválidos', async () => {
      await expect(AulaIdSchema.parseAsync('id-invalido'))
        .rejects.toThrow('ID da aula inválido');

      await expect(AulaIdSchema.parseAsync('123'))
        .rejects.toThrow('ID da aula inválido');
    });
  });
});