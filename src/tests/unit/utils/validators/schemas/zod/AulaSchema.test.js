  import { jest } from '@jest/globals';
  import mongoose from 'mongoose';
  import { AulaSchema, AulaUpdateSchema } from '../../../../../../utils/validators/schemas/zod/AulaSchema.js';

  describe('AulaSchema', () => {
    describe('Validações básicas', () => {
      it('deve validar dados válidos corretamente', () => {
        const dadosValidos = {
          titulo: 'Introdução ao JavaScript',
          descricao: 'Aula introdutória sobre JavaScript',
          conteudoURL: 'https://example.com/aula1',
          cargaHoraria: 60,
          cursoId: new mongoose.Types.ObjectId().toString(),
          criadoPorId: new mongoose.Types.ObjectId().toString()
        };

        const resultado = AulaSchema.parse(dadosValidos);
        expect(resultado.titulo).toBe(dadosValidos.titulo);
        expect(resultado.descricao).toBe(dadosValidos.descricao);
        expect(resultado.conteudoURL).toBe(dadosValidos.conteudoURL);
        expect(resultado.cargaHoraria).toBe(dadosValidos.cargaHoraria);
        expect(resultado.cursoId).toBe(dadosValidos.cursoId);
        expect(resultado.criadoPorId).toBe(dadosValidos.criadoPorId);
      });

      it('deve aceitar materialComplementar opcional', () => {
        const dadosValidos = {
          titulo: 'Aula com Material',
          conteudoURL: 'https://example.com/aula2',
          cargaHoraria: 45,
          cursoId: new mongoose.Types.ObjectId().toString(),
          criadoPorId: new mongoose.Types.ObjectId().toString(),
          materialComplementar: ['https://link1.com', 'https://link2.com']
        };

        const resultado = AulaSchema.parse(dadosValidos);
        expect(resultado.materialComplementar).toEqual(dadosValidos.materialComplementar);
      });

      it('deve inicializar materialComplementar como array vazio quando não fornecido', () => {
        const dadosValidos = {
          titulo: 'Aula sem Material',
          conteudoURL: 'https://example.com/aula3',
          cargaHoraria: 30,
          cursoId: new mongoose.Types.ObjectId().toString(),
          criadoPorId: new mongoose.Types.ObjectId().toString()
        };

        const resultado = AulaSchema.parse(dadosValidos);
        expect(resultado.materialComplementar).toEqual([]);
      });
    });

    describe('Validações de campos obrigatórios', () => {
      it('deve lançar erro quando titulo está ausente', () => {
        const dadosInvalidos = {
          conteudoURL: 'https://example.com/aula4',
          cargaHoraria: 60,
          cursoId: new mongoose.Types.ObjectId().toString(),
          criadoPorId: new mongoose.Types.ObjectId().toString()
        };

        expect(() => AulaSchema.parse(dadosInvalidos)).toThrow();
      });

      it('deve lançar erro quando titulo é muito curto', () => {
        const dadosInvalidos = {
          titulo: 'A',
          conteudoURL: 'https://example.com/aula5',
          cargaHoraria: 60,
          cursoId: new mongoose.Types.ObjectId().toString(),
          criadoPorId: new mongoose.Types.ObjectId().toString()
        };

        expect(() => AulaSchema.parse(dadosInvalidos)).toThrow(/mínimo de 3 caracteres/);
      });

      it('deve lançar erro quando conteudoURL é inválida', () => {
        const dadosInvalidos = {
          titulo: 'Aula Inválida',
          conteudoURL: 'não-é-uma-url',
          cargaHoraria: 60,
          cursoId: new mongoose.Types.ObjectId().toString(),
          criadoPorId: new mongoose.Types.ObjectId().toString()
        };

        expect(() => AulaSchema.parse(dadosInvalidos)).toThrow(/URL inválida/);
      });

      it('deve lançar erro quando cargaHoraria não é um número inteiro positivo', () => {
        const dadosInvalidos = {
          titulo: 'Aula Inválida',
          conteudoURL: 'https://example.com/aula6',
          cargaHoraria: -10,
          cursoId: new mongoose.Types.ObjectId().toString(),
          criadoPorId: new mongoose.Types.ObjectId().toString()
        };

        expect(() => AulaSchema.parse(dadosInvalidos)).toThrow(/número inteiro positivo/);
      });

      it('deve lançar erro quando cursoId é inválido', () => {
        const dadosInvalidos = {
          titulo: 'Aula Inválida',
          conteudoURL: 'https://example.com/aula7',
          cargaHoraria: 60,
          cursoId: 'id-invalido',
          criadoPorId: new mongoose.Types.ObjectId().toString()
        };

        expect(() => AulaSchema.parse(dadosInvalidos)).toThrow(/ID inválido/);
      });
    });
  });

  describe('AulaUpdateSchema', () => {
    it('deve validar atualizações parciais corretamente', () => {
      const dadosAtualizacao = {
        titulo: 'Novo Título',
        descricao: 'Nova descrição'
      };

      const resultado = AulaUpdateSchema.parse(dadosAtualizacao);
      expect(resultado.titulo).toBe(dadosAtualizacao.titulo);
      expect(resultado.descricao).toBe(dadosAtualizacao.descricao);
    });

    it('deve aceitar objeto vazio para atualização', () => {
      const resultado = AulaUpdateSchema.parse({});
      expect(resultado).toEqual({});
    });

    it('deve lançar erro quando tentar atualizar com cargaHoraria inválida', () => {
      const dadosInvalidos = {
        cargaHoraria: 0
      };

      expect(() => AulaUpdateSchema.parse(dadosInvalidos)).toThrow(/número inteiro positivo/);
    });

    it('deve permitir atualizar materialComplementar', () => {
      const dadosAtualizacao = {
        materialComplementar: ['https://novolink.com']
      };

      const resultado = AulaUpdateSchema.parse(dadosAtualizacao);
      expect(resultado.materialComplementar).toEqual(dadosAtualizacao.materialComplementar);
    });
  });