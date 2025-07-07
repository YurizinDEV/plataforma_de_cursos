import {
    jest
} from '@jest/globals';
import {
    UsuarioSchema,
    UsuarioUpdateSchema
} from '../../../../../../utils/validators/schemas/zod/UsuarioSchema.js';
import mongoose from 'mongoose';

describe('UsuarioSchema', () => {
    it('deve validar dados válidos corretamente', () => {
        const dadosValidos = {
            nome: 'João Silva',
            email: 'joao@email.com',
            senha: 'Senha@123',
            ativo: false,
        };
        const resultado = UsuarioSchema.parse(dadosValidos);
        expect(resultado.nome).toBe(dadosValidos.nome);
        expect(resultado.email).toBe(dadosValidos.email);
        expect(resultado.senha).toBe(dadosValidos.senha);
        expect(resultado.ativo).toBe(dadosValidos.ativo);
    });
    it('deve aplicar valor padrão para "ativo" quando não fornecido', () => {
        const dadosValidos = {
            nome: 'Maria',
            email: 'maria@email.com',
            senha: 'Senha@123',
        };
        const resultado = UsuarioSchema.parse(dadosValidos);
        expect(resultado.ativo).toBe(false);
    });

    it('deve aplicar valor padrão para "ehAdmin" quando não fornecido', () => {
        const dadosValidos = {
            nome: 'João',
            email: 'joao@email.com',
            senha: 'Senha@123',
        };
        const resultado = UsuarioSchema.parse(dadosValidos);
        expect(resultado.ehAdmin).toBe(false);
    });

    it('deve permitir definir explicitamente o valor de "ehAdmin"', () => {
        const dadosValidos = {
            nome: 'João Admin',
            email: 'admin@email.com',
            senha: 'Senha@123',
            ehAdmin: true,
        };
        const resultado = UsuarioSchema.parse(dadosValidos);
        expect(resultado.ehAdmin).toBe(true);
    });

    it('deve lançar erro quando "nome" está ausente', () => {
        const dadosInvalidos = {
            email: 'joao@email.com',
            senha: 'Senha@123',
            ativo: true,
        };
        expect(() => UsuarioSchema.parse(dadosInvalidos)).toThrow(/Required/);
    });

    it('deve lançar erro quando "nome" está vazio', () => {
        const dadosInvalidos = {
            nome: '',
            email: 'joao@email.com',
            senha: 'Senha@123',
            ativo: true,
        };
        expect(() => UsuarioSchema.parse(dadosInvalidos)).toThrow(/obrigat/);
    });

    it('deve lançar erro quando "email" está ausente', () => {
        const dadosInvalidos = {
            nome: 'João',
            senha: 'Senha@123',
            ativo: true,
        };
        expect(() => UsuarioSchema.parse(dadosInvalidos)).toThrow(/Required/);
    });

    it('deve lançar erro quando "email" está vazio', () => {
        const dadosInvalidos = {
            nome: 'João',
            email: '',
            senha: 'Senha@123',
            ativo: true,
        };
        expect(() => UsuarioSchema.parse(dadosInvalidos)).toThrow(/obrigat/);
    });

    it('deve lançar erro quando "email" é inválido', () => {
        const dadosInvalidos = {
            nome: 'João',
            email: 'joaoemail.com',
            senha: 'Senha@123',
            ativo: true,
        };
        expect(() => UsuarioSchema.parse(dadosInvalidos)).toThrow(/email.*inválido/);
    });

    it('deve lançar erro quando "senha" é muito curta', () => {
        const dadosInvalidos = {
            nome: 'João',
            email: 'joao@email.com',
            senha: 'S@1a',
            ativo: true,
        };
        expect(() => UsuarioSchema.parse(dadosInvalidos)).toThrow(/senha.*8 caracteres/);
    });

    it('deve lançar erro quando "senha" não atende à complexidade', () => {
        const dadosInvalidos = {
            nome: 'João',
            email: 'joao@email.com',
            senha: 'senhasimples',
            ativo: true,
        };
        expect(() => UsuarioSchema.parse(dadosInvalidos)).toThrow(/senha.*maiúscula.*minúscula.*número.*especial/);
    });

    it('deve lançar erro quando "senha" está vazia', () => {
        const dadosInvalidos = {
            nome: 'João',
            email: 'joao@email.com',
            senha: '',
            ativo: true,
        };
        expect(() => UsuarioSchema.parse(dadosInvalidos)).toThrow(/8 caracteres/);
    });

    it('deve aceitar "link_foto" opcional quando fornecido', () => {
        const dadosValidos = {
            nome: 'Usuário com Foto',
            email: 'foto@email.com',
            senha: 'Senha@123',
            link_foto: 'https://example.com/foto.jpg'
        };
        const resultado = UsuarioSchema.parse(dadosValidos);
        expect(resultado.link_foto).toBe('https://example.com/foto.jpg');
    });

    it('deve inicializar "progresso" como array vazio quando não fornecido', () => {
        const dadosValidos = {
            nome: 'Usuário Sem Progresso',
            email: 'noprogress@email.com',
            senha: 'Senha@123',
        };
        const resultado = UsuarioSchema.parse(dadosValidos);
        expect(resultado.progresso).toEqual([]);
    });

    it('deve validar corretamente o array "progresso" quando fornecido', () => {
        const objectId = new mongoose.Types.ObjectId().toString();
        const dadosValidos = {
            nome: 'Usuário com Progresso',
            email: 'progress@email.com',
            senha: 'Senha@123',
            progresso: [{
                percentual_conclusao: '75',
                curso: objectId
            }]
        };
        const resultado = UsuarioSchema.parse(dadosValidos);
        expect(resultado.progresso[0].percentual_conclusao).toBe('75');
        expect(resultado.progresso[0].curso).toBe(objectId);
    });

    it('deve lançar erro quando "percentual_conclusao" está vazio no array progresso', () => {
        const objectId = new mongoose.Types.ObjectId().toString();
        const dadosInvalidos = {
            nome: 'Usuário',
            email: 'user@email.com',
            senha: 'Senha@123',
            progresso: [{
                percentual_conclusao: '',
                curso: objectId
            }]
        };
        expect(() => UsuarioSchema.parse(dadosInvalidos)).toThrow(/Percentual de conclusão/);
    });

    it('deve inicializar "cursosIds" como array vazio quando não fornecido', () => {
        const dadosValidos = {
            nome: 'Usuário Sem Cursos',
            email: 'nocursos@email.com',
            senha: 'Senha@123',
        };
        const resultado = UsuarioSchema.parse(dadosValidos);
        expect(resultado.cursosIds).toEqual([]);
    });

    it('deve validar corretamente o array "cursosIds" quando fornecido', () => {
        const cursoId1 = new mongoose.Types.ObjectId().toString();
        const cursoId2 = new mongoose.Types.ObjectId().toString();
        const dadosValidos = {
            nome: 'Usuário Com Cursos',
            email: 'cursos@email.com',
            senha: 'Senha@123',
            cursosIds: [cursoId1, cursoId2]
        };
        const resultado = UsuarioSchema.parse(dadosValidos);
        expect(resultado.cursosIds).toContain(cursoId1);
        expect(resultado.cursosIds).toContain(cursoId2);
    });

    it('deve lançar erro quando há IDs duplicados no array cursosIds', () => {
        const cursoId = new mongoose.Types.ObjectId().toString();
        const dadosInvalidos = {
            nome: 'Usuário',
            email: 'duplicated@email.com',
            senha: 'Senha@123',
            cursosIds: [cursoId, cursoId]
        };
        expect(() => UsuarioSchema.parse(dadosInvalidos)).toThrow(/Não pode conter IDs repetidos/);
    });

    it('deve lançar erro quando há um ID inválido no array cursosIds', () => {
        const dadosInvalidos = {
            nome: 'Usuário',
            email: 'user@email.com',
            senha: 'Senha@123',
            cursosIds: ['invalid-id']
        };
        expect(() => UsuarioSchema.parse(dadosInvalidos)).toThrow(/Invalid MongoDB ObjectId/);
    });
});

describe('UsuarioUpdateSchema', () => {
    it('deve validar dados parciais corretamente', () => {
        const dadosParciais = {
            nome: 'Novo Nome'
        };
        const resultado = UsuarioUpdateSchema.parse(dadosParciais);
        expect(resultado.nome).toBe('Novo Nome');
        expect(resultado.senha).toBeUndefined();
        expect(resultado.ativo).toBeUndefined();
    });

    it('deve aceitar objeto vazio e manter campos indefinidos', () => {
        const resultado = UsuarioUpdateSchema.parse({});
        expect(resultado.nome).toBeUndefined();
        expect(resultado.senha).toBeUndefined();
        expect(resultado.ativo).toBeUndefined();
    });

    it('deve lançar erro quando "senha" é muito curta', () => {
        const dadosInvalidos = {
            senha: 'S@1a'
        };
        expect(() => UsuarioUpdateSchema.parse(dadosInvalidos)).toThrow(/senha.*8 caracteres/);
    });

    it('deve lançar erro quando "senha" não atende à complexidade', () => {
        const dadosInvalidos = {
            senha: 'senhasimples'
        };
        expect(() => UsuarioUpdateSchema.parse(dadosInvalidos)).toThrow(/senha.*maiúscula.*minúscula.*número.*especial/);
    });

    it('deve lançar erro quando "senha" está vazia', () => {
        const dadosInvalidos = {
            senha: ''
        };
        expect(() => UsuarioUpdateSchema.parse(dadosInvalidos)).toThrow(/8 caracteres/);
    });

    it('deve permitir atualizar apenas o campo "ehAdmin"', () => {
        const dadosParciais = {
            ehAdmin: true
        };
        const resultado = UsuarioUpdateSchema.parse(dadosParciais);
        expect(resultado.ehAdmin).toBe(true);
        expect(resultado.nome).toBeUndefined();
    });

    it('deve permitir atualizar apenas o campo "link_foto"', () => {
        const dadosParciais = {
            link_foto: 'https://example.com/nova-foto.jpg'
        };
        const resultado = UsuarioUpdateSchema.parse(dadosParciais);
        expect(resultado.link_foto).toBe('https://example.com/nova-foto.jpg');
        expect(resultado.nome).toBeUndefined();
    });

    it('deve validar corretamente quando atualiza apenas o array "progresso"', () => {
        const objectId = new mongoose.Types.ObjectId().toString();
        const dadosParciais = {
            progresso: [{
                percentual_conclusao: '90',
                curso: objectId
            }]
        };
        const resultado = UsuarioUpdateSchema.parse(dadosParciais);
        expect(resultado.progresso[0].percentual_conclusao).toBe('90');
        expect(resultado.progresso[0].curso).toBe(objectId);
    });

    it('deve validar corretamente quando atualiza apenas o array "cursosIds"', () => {
        const cursoId = new mongoose.Types.ObjectId().toString();
        const dadosParciais = {
            cursosIds: [cursoId]
        };
        const resultado = UsuarioUpdateSchema.parse(dadosParciais);
        expect(resultado.cursosIds).toContain(cursoId);
    });

    it('deve lançar erro quando há IDs duplicados no array "cursosIds" durante atualização', () => {
        const cursoId = new mongoose.Types.ObjectId().toString();
        const dadosInvalidos = {
            cursosIds: [cursoId, cursoId]
        };
        expect(() => UsuarioUpdateSchema.parse(dadosInvalidos)).toThrow(/Não pode conter IDs repetidos/);
    });
});