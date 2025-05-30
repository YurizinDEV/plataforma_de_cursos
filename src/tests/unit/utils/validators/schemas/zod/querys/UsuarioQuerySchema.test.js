import {
    jest
} from '@jest/globals';
import mongoose from 'mongoose';
import {
    UsuarioQuerySchema,
    UsuarioIdSchema
} from '../../../../../../../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';

describe('UsuarioQuerySchema', () => {
    // Testes para validação campo a campo
    describe('Validações de campo', () => {
        it('deve aceitar query vazia', async () => {
            const resultado = await UsuarioQuerySchema.parseAsync({});
            expect(resultado).toBeDefined();
        });

        describe('Campo nome', () => {
            it('deve validar nome corretamente', async () => {
                const resultado = await UsuarioQuerySchema.parseAsync({
                    nome: 'João'
                });
                expect(resultado.nome).toBe('João');
            });

            it('deve fazer trim do nome', async () => {
                const resultado = await UsuarioQuerySchema.parseAsync({
                    nome: '  João  '
                });
                expect(resultado.nome).toBe('João');
            });

            it('deve rejeitar nome vazio após trim', async () => {
                await expect(UsuarioQuerySchema.parseAsync({
                        nome: '   '
                    }))
                    .rejects.toThrow('Nome não pode ser vazio');
            });
        });

        describe('Campo email', () => {
            it('deve validar email corretamente', async () => {
                const resultado = await UsuarioQuerySchema.parseAsync({
                    email: 'joao@example.com'
                });
                expect(resultado.email).toBe('joao@example.com');
            });

            it('deve rejeitar email com formato inválido', async () => {
                await expect(UsuarioQuerySchema.parseAsync({
                        email: 'email-invalido'
                    }))
                    .rejects.toThrow('Formato de email inválido');
            });
        });

        describe('Campo ativo', () => {
            it('deve validar ativo="true" corretamente', async () => {
                const resultado = await UsuarioQuerySchema.parseAsync({
                    ativo: 'true'
                });
                expect(resultado.ativo).toBe('true');
            });

            it('deve validar ativo="false" corretamente', async () => {
                const resultado = await UsuarioQuerySchema.parseAsync({
                    ativo: 'false'
                });
                expect(resultado.ativo).toBe('false');
            });

            it('deve rejeitar valores inválidos para ativo', async () => {
                await expect(UsuarioQuerySchema.parseAsync({
                        ativo: 'sim'
                    }))
                    .rejects.toThrow("Ativo deve ser 'true' ou 'false'");
            });
        });

        describe('Campos grupo e unidade', () => {
            it('deve validar grupo corretamente', async () => {
                const resultado = await UsuarioQuerySchema.parseAsync({
                    grupo: 'Admin'
                });
                expect(resultado.grupo).toBe('Admin');
            });

            it('deve fazer trim do campo grupo', async () => {
                const resultado = await UsuarioQuerySchema.parseAsync({
                    grupo: '  Admin  '
                });
                expect(resultado.grupo).toBe('Admin');
            });

            it('deve validar unidade corretamente', async () => {
                const resultado = await UsuarioQuerySchema.parseAsync({
                    unidade: 'Matriz'
                });
                expect(resultado.unidade).toBe('Matriz');
            });

            it('deve fazer trim do campo unidade', async () => {
                const resultado = await UsuarioQuerySchema.parseAsync({
                    unidade: '  Matriz  '
                });
                expect(resultado.unidade).toBe('Matriz');
            });
        });

        describe('Campo page', () => {
            it('deve validar page corretamente', async () => {
                const resultado = await UsuarioQuerySchema.parseAsync({
                    page: '2'
                });
                expect(resultado.page).toBe(2);
            });

            it('deve usar valor padrão 1 quando page não é fornecido', async () => {
                const resultado = await UsuarioQuerySchema.parseAsync({});
                expect(resultado.page).toBe(1);
            });

            it('deve rejeitar valores não numéricos para page', async () => {
                await expect(UsuarioQuerySchema.parseAsync({
                        page: 'abc'
                    }))
                    .rejects.toThrow('Page deve ser um número inteiro maior que 0');
            });

            it('deve rejeitar números negativos ou zero para page', async () => {
                await expect(UsuarioQuerySchema.parseAsync({
                        page: '0'
                    }))
                    .rejects.toThrow('Page deve ser um número inteiro maior que 0');

                await expect(UsuarioQuerySchema.parseAsync({
                        page: '-1'
                    }))
                    .rejects.toThrow('Page deve ser um número inteiro maior que 0');
            });
        });

        describe('Campo limite', () => {
            it('deve validar limite corretamente', async () => {
                const resultado = await UsuarioQuerySchema.parseAsync({
                    limite: '20'
                });
                expect(resultado.limite).toBe(20);
            });

            it('deve usar valor padrão 10 quando limite não é fornecido', async () => {
                const resultado = await UsuarioQuerySchema.parseAsync({});
                expect(resultado.limite).toBe(10);
            });

            it('deve rejeitar valores não numéricos para limite', async () => {
                await expect(UsuarioQuerySchema.parseAsync({
                        limite: 'abc'
                    }))
                    .rejects.toThrow('Limite deve ser um número inteiro entre 1 e 100');
            });

            it('deve rejeitar números negativos ou zero para limite', async () => {
                await expect(UsuarioQuerySchema.parseAsync({
                        limite: '0'
                    }))
                    .rejects.toThrow('Limite deve ser um número inteiro entre 1 e 100');

                await expect(UsuarioQuerySchema.parseAsync({
                        limite: '-10'
                    }))
                    .rejects.toThrow('Limite deve ser um número inteiro entre 1 e 100');
            });

            it('deve rejeitar números maiores que 100 para limite', async () => {
                await expect(UsuarioQuerySchema.parseAsync({
                        limite: '101'
                    }))
                    .rejects.toThrow('Limite deve ser um número inteiro entre 1 e 100');
            });
        });
    });

    // Testes para múltiplos campos ao mesmo tempo
    describe('Validações de múltiplos campos', () => {
        it('deve aceitar múltiplos campos válidos', async () => {
            const query = {
                nome: 'João',
                email: 'joao@example.com',
                ativo: 'true',
                grupo: 'Administradores',
                unidade: 'Unidade Principal',
                page: '2',
                limite: '50'
            };

            const resultado = await UsuarioQuerySchema.parseAsync(query);

            expect(resultado.nome).toBe('João');
            expect(resultado.email).toBe('joao@example.com');
            expect(resultado.ativo).toBe('true');
            expect(resultado.grupo).toBe('Administradores');
            expect(resultado.unidade).toBe('Unidade Principal');
            expect(resultado.page).toBe(2);
            expect(resultado.limite).toBe(50);
        });

        it('deve rejeitar quando um dos campos é inválido', async () => {
            const query = {
                nome: 'João',
                email: 'joao@example.com',
                ativo: 'invalido' // inválido
            };

            await expect(UsuarioQuerySchema.parseAsync(query))
                .rejects.toThrow();
        });
    });

    describe('UsuarioIdSchema', () => {
        it('deve validar um ID válido de MongoDB', async () => {
            const id = new mongoose.Types.ObjectId().toString();
            const resultado = await UsuarioIdSchema.parseAsync(id);
            expect(resultado).toBe(id);
        });

        it('deve rejeitar IDs inválidos', async () => {
            await expect(UsuarioIdSchema.parseAsync('id-invalido'))
                .rejects.toThrow('ID inválido');

            await expect(UsuarioIdSchema.parseAsync('123'))
                .rejects.toThrow('ID inválido');
        });
    });
});