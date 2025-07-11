import {
    jest
} from '@jest/globals';
import mongoose from 'mongoose';
import {
    UsuarioQuerySchema,
    UsuarioIdSchema
} from '../../../../../../../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';

describe('UsuarioQuerySchema', () => {

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

        describe('Campo grupos', () => {
            it('deve validar grupos com valor string', async () => {
                const resultado = await UsuarioQuerySchema.parseAsync({
                    grupos: 'Administradores'
                });
                expect(resultado.grupos).toBe('Administradores');
            });

            it('deve aceitar grupos undefined/vazio', async () => {
                const resultado1 = await UsuarioQuerySchema.parseAsync({});
                expect(resultado1.grupos).toBeUndefined();

                const resultado2 = await UsuarioQuerySchema.parseAsync({
                    grupos: undefined
                });
                expect(resultado2.grupos).toBeUndefined();
            });

            it('deve aceitar qualquer string para grupos', async () => {
                const resultado = await UsuarioQuerySchema.parseAsync({
                    grupos: 'QualquerGrupo'
                });
                expect(resultado.grupos).toBe('QualquerGrupo');
            });
        });

        describe('Campo dataInicio', () => {
            it('deve validar dataInicio corretamente', async () => {
                const resultado = await UsuarioQuerySchema.parseAsync({
                    dataInicio: '2023-01-01'
                });
                expect(resultado.dataInicio).toBe('2023-01-01');
            });

            it('deve aceitar diferentes formatos válidos de data', async () => {
                const datasValidas = [
                    '2023-12-25',
                    '2023-01-01T10:30:00Z',
                    '2023/01/01',
                    'December 25, 2023',
                    '25 Dec 2023'
                ];

                for (const data of datasValidas) {
                    const resultado = await UsuarioQuerySchema.parseAsync({
                        dataInicio: data
                    });
                    expect(resultado.dataInicio).toBe(data);
                }
            });

            it('deve aceitar dataInicio undefined/vazio', async () => {
                const resultado1 = await UsuarioQuerySchema.parseAsync({});
                expect(resultado1.dataInicio).toBeUndefined();

                const resultado2 = await UsuarioQuerySchema.parseAsync({
                    dataInicio: undefined
                });
                expect(resultado2.dataInicio).toBeUndefined();
            });

            it('deve rejeitar datas inválidas para dataInicio', async () => {
                await expect(UsuarioQuerySchema.parseAsync({
                        dataInicio: 'data-invalida'
                    }))
                    .rejects.toThrow("dataInicio deve ser uma data válida (YYYY-MM-DD)");

                await expect(UsuarioQuerySchema.parseAsync({
                        dataInicio: '2023-13-01'
                    }))
                    .rejects.toThrow("dataInicio deve ser uma data válida (YYYY-MM-DD)");

                await expect(UsuarioQuerySchema.parseAsync({
                        dataInicio: '32/01/2023'
                    }))
                    .rejects.toThrow("dataInicio deve ser uma data válida (YYYY-MM-DD)");

                await expect(UsuarioQuerySchema.parseAsync({
                        dataInicio: 'abc123'
                    }))
                    .rejects.toThrow("dataInicio deve ser uma data válida (YYYY-MM-DD)");
            });
        });

        describe('Campo dataFim', () => {
            it('deve validar dataFim corretamente', async () => {
                const resultado = await UsuarioQuerySchema.parseAsync({
                    dataFim: '2023-12-31'
                });
                expect(resultado.dataFim).toBe('2023-12-31');
            });

            it('deve aceitar diferentes formatos válidos de data', async () => {
                const datasValidas = [
                    '2023-12-31',
                    '2023-12-31T23:59:59Z',
                    '2023/12/31',
                    'December 31, 2023',
                    '31 Dec 2023'
                ];

                for (const data of datasValidas) {
                    const resultado = await UsuarioQuerySchema.parseAsync({
                        dataFim: data
                    });
                    expect(resultado.dataFim).toBe(data);
                }
            });

            it('deve aceitar dataFim undefined/vazio', async () => {
                const resultado1 = await UsuarioQuerySchema.parseAsync({});
                expect(resultado1.dataFim).toBeUndefined();

                const resultado2 = await UsuarioQuerySchema.parseAsync({
                    dataFim: undefined
                });
                expect(resultado2.dataFim).toBeUndefined();
            });

            it('deve rejeitar datas inválidas para dataFim', async () => {
                await expect(UsuarioQuerySchema.parseAsync({
                        dataFim: 'data-invalida'
                    }))
                    .rejects.toThrow("dataFim deve ser uma data válida (YYYY-MM-DD)");

                await expect(UsuarioQuerySchema.parseAsync({
                        dataFim: '2023-13-31'
                    }))
                    .rejects.toThrow("dataFim deve ser uma data válida (YYYY-MM-DD)");

                await expect(UsuarioQuerySchema.parseAsync({
                        dataFim: '40/12/2023'
                    }))
                    .rejects.toThrow("dataFim deve ser uma data válida (YYYY-MM-DD)");

                await expect(UsuarioQuerySchema.parseAsync({
                        dataFim: 'xyz789'
                    }))
                    .rejects.toThrow("dataFim deve ser uma data válida (YYYY-MM-DD)");
            });
        });

        describe('Campo ordenarPor', () => {
            it('deve validar valores válidos para ordenarPor', async () => {
                const valoresValidos = ['nome', 'email', 'createdAt', 'updatedAt'];

                for (const valor of valoresValidos) {
                    const resultado = await UsuarioQuerySchema.parseAsync({
                        ordenarPor: valor
                    });
                    expect(resultado.ordenarPor).toBe(valor);
                }
            });

            it('deve aceitar ordenarPor undefined/vazio', async () => {
                const resultado1 = await UsuarioQuerySchema.parseAsync({});
                expect(resultado1.ordenarPor).toBeUndefined();

                const resultado2 = await UsuarioQuerySchema.parseAsync({
                    ordenarPor: undefined
                });
                expect(resultado2.ordenarPor).toBeUndefined();
            });

            it('deve rejeitar valores inválidos para ordenarPor', async () => {
                await expect(UsuarioQuerySchema.parseAsync({
                        ordenarPor: 'campo-invalido'
                    }))
                    .rejects.toThrow("ordenarPor deve ser um dos valores: nome, email, createdAt, updatedAt");

                await expect(UsuarioQuerySchema.parseAsync({
                        ordenarPor: 'id'
                    }))
                    .rejects.toThrow("ordenarPor deve ser um dos valores: nome, email, createdAt, updatedAt");

                await expect(UsuarioQuerySchema.parseAsync({
                        ordenarPor: 'data'
                    }))
                    .rejects.toThrow("ordenarPor deve ser um dos valores: nome, email, createdAt, updatedAt");

                await expect(UsuarioQuerySchema.parseAsync({
                        ordenarPor: 'status'
                    }))
                    .rejects.toThrow("ordenarPor deve ser um dos valores: nome, email, createdAt, updatedAt");
            });
        });

        describe('Campo direcao', () => {
            it('deve validar direcao="asc" corretamente', async () => {
                const resultado = await UsuarioQuerySchema.parseAsync({
                    direcao: 'asc'
                });
                expect(resultado.direcao).toBe('asc');
            });

            it('deve validar direcao="desc" corretamente', async () => {
                const resultado = await UsuarioQuerySchema.parseAsync({
                    direcao: 'desc'
                });
                expect(resultado.direcao).toBe('desc');
            });

            it('deve aceitar direcao em maiúsculo (case insensitive)', async () => {
                const resultado1 = await UsuarioQuerySchema.parseAsync({
                    direcao: 'ASC'
                });
                expect(resultado1.direcao).toBe('ASC');

                const resultado2 = await UsuarioQuerySchema.parseAsync({
                    direcao: 'DESC'
                });
                expect(resultado2.direcao).toBe('DESC');

                const resultado3 = await UsuarioQuerySchema.parseAsync({
                    direcao: 'AsC'
                });
                expect(resultado3.direcao).toBe('AsC');
            });

            it('deve aceitar direcao undefined/vazio', async () => {
                const resultado1 = await UsuarioQuerySchema.parseAsync({});
                expect(resultado1.direcao).toBeUndefined();

                const resultado2 = await UsuarioQuerySchema.parseAsync({
                    direcao: undefined
                });
                expect(resultado2.direcao).toBeUndefined();
            });

            it('deve rejeitar valores inválidos para direcao', async () => {
                await expect(UsuarioQuerySchema.parseAsync({
                        direcao: 'crescente'
                    }))
                    .rejects.toThrow("direcao deve ser 'asc' ou 'desc'");

                await expect(UsuarioQuerySchema.parseAsync({
                        direcao: 'decrescente'
                    }))
                    .rejects.toThrow("direcao deve ser 'asc' ou 'desc'");

                await expect(UsuarioQuerySchema.parseAsync({
                        direcao: 'up'
                    }))
                    .rejects.toThrow("direcao deve ser 'asc' ou 'desc'");

                await expect(UsuarioQuerySchema.parseAsync({
                        direcao: 'down'
                    }))
                    .rejects.toThrow("direcao deve ser 'asc' ou 'desc'");

                await expect(UsuarioQuerySchema.parseAsync({
                        direcao: '1'
                    }))
                    .rejects.toThrow("direcao deve ser 'asc' ou 'desc'");
            });
        });
    });


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

        it('deve aceitar todos os campos válidos incluindo novos campos', async () => {
            const query = {
                nome: 'João Silva',
                email: 'joao.silva@example.com',
                ativo: 'false',
                grupos: 'Administradores',
                dataInicio: '2023-01-01',
                dataFim: '2023-12-31',
                ordenarPor: 'nome',
                direcao: 'asc',
                grupo: 'Administradores',
                unidade: 'Unidade Principal',
                page: '3',
                limite: '25'
            };

            const resultado = await UsuarioQuerySchema.parseAsync(query);

            expect(resultado.nome).toBe('João Silva');
            expect(resultado.email).toBe('joao.silva@example.com');
            expect(resultado.ativo).toBe('false');
            expect(resultado.grupos).toBe('Administradores');
            expect(resultado.dataInicio).toBe('2023-01-01');
            expect(resultado.dataFim).toBe('2023-12-31');
            expect(resultado.ordenarPor).toBe('nome');
            expect(resultado.direcao).toBe('asc');
            expect(resultado.grupo).toBe('Administradores');
            expect(resultado.unidade).toBe('Unidade Principal');
            expect(resultado.page).toBe(3);
            expect(resultado.limite).toBe(25);
        });

        it('deve rejeitar quando um dos campos é inválido', async () => {
            const query = {
                nome: 'João',
                email: 'joao@example.com',
                ativo: 'invalido'
            };

            await expect(UsuarioQuerySchema.parseAsync(query))
                .rejects.toThrow();
        });

        it('deve rejeitar quando múltiplos campos são inválidos', async () => {
            const query = {
                nome: '   ',
                email: 'email-invalido',
                ativo: 'sim',
                grupos: '',
                dataInicio: 'data-invalida',
                dataFim: 'outra-data-invalida',
                ordenarPor: 'campo-inexistente',
                direcao: 'para-cima',
                page: '0',
                limite: '150'
            };

            await expect(UsuarioQuerySchema.parseAsync(query))
                .rejects.toThrow();
        });

        it('deve processar corretamente combinações válidas de filtros de data e ordenação', async () => {
            const query = {
                dataInicio: '2023-01-01',
                dataFim: '2023-06-30',
                ordenarPor: 'createdAt',
                direcao: 'DESC'
            };

            const resultado = await UsuarioQuerySchema.parseAsync(query);

            expect(resultado.dataInicio).toBe('2023-01-01');
            expect(resultado.dataFim).toBe('2023-06-30');
            expect(resultado.ordenarPor).toBe('createdAt');
            expect(resultado.direcao).toBe('DESC');
        });

        it('deve aplicar transformações corretamente em múltiplos campos', async () => {
            const query = {
                nome: '  João Silva  ',
                grupo: '  Administradores  ',
                unidade: '  Unidade Principal  ',
                page: '5',
                limite: '20'
            };

            const resultado = await UsuarioQuerySchema.parseAsync(query);

            expect(resultado.nome).toBe('João Silva');
            expect(resultado.grupo).toBe('Administradores');
            expect(resultado.unidade).toBe('Unidade Principal');
            expect(resultado.page).toBe(5);
            expect(resultado.limite).toBe(20);
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