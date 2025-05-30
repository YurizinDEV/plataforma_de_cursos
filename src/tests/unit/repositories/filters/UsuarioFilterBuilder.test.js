import UsuarioFilterBuilder from '../../../../repositories/filters/UsuarioFilterBuilder.js';
import UsuarioRepository from '../../../../repositories/UsuarioRepository.js';
import mongoose from 'mongoose';

// Mock das dependências
jest.mock('../../../../models/Usuario.js', () => ({
    /* Um mock do modelo do mongoose */
}));

jest.mock('../../../../repositories/UsuarioRepository.js', () => {
    return jest.fn().mockImplementation(() => {
        return {};
    });
});

describe('UsuarioFilterBuilder', () => {
    let builder;

    beforeEach(() => {
        // Limpar todos os mocks antes de cada teste
        jest.clearAllMocks();
        // Criar uma nova instância do builder para cada teste
        builder = new UsuarioFilterBuilder();
    });

    describe('Inicialização', () => {
        it('deve inicializar com filtros vazios', () => {
            expect(builder.filtros).toEqual({});
            expect(builder.usuarioRepository).toBeDefined();
            expect(builder.usuarioModel).toBeDefined();
        });
    });

    describe('Método comNome', () => {
        it('deve adicionar filtro por nome quando valor válido é fornecido', () => {
            const result = builder.comNome('João');
            expect(result).toBe(builder); // Verifica encadeamento de métodos
            expect(builder.filtros.nome).toEqual({
                $regex: 'João',
                $options: 'i'
            });
        });

        it('não deve adicionar filtro por nome quando valor é nulo ou vazio', () => {
            builder.comNome(null);
            expect(builder.filtros.nome).toBeUndefined();

            builder.comNome('');
            expect(builder.filtros.nome).toBeUndefined();
        });
    });

    describe('Método comEmail', () => {
        it('deve adicionar filtro por email quando valor válido é fornecido', () => {
            const result = builder.comEmail('test@example.com');
            expect(result).toBe(builder); // Verifica encadeamento de métodos
            expect(builder.filtros.email).toEqual({
                $regex: 'test@example.com',
                $options: 'i'
            });
        });

        it('não deve adicionar filtro por email quando valor é nulo ou vazio', () => {
            builder.comEmail(null);
            expect(builder.filtros.email).toBeUndefined();

            builder.comEmail('');
            expect(builder.filtros.email).toBeUndefined();
        });
    });

    describe('Método comAtivo', () => {
        it('deve adicionar filtro para usuários ativos quando valor é "true"', () => {
            const result = builder.comAtivo('true');
            expect(result).toBe(builder); // Verifica encadeamento de métodos
            expect(builder.filtros.ativo).toBe(true);
        });

        it('deve adicionar filtro para usuários inativos quando valor é "false"', () => {
            const result = builder.comAtivo('false');
            expect(result).toBe(builder);
            expect(builder.filtros.ativo).toBe(false);
        });

        it('não deve adicionar filtro por ativo quando valor é nulo ou diferente de true/false', () => {
            builder.comAtivo(null);
            expect(builder.filtros.ativo).toBeUndefined();

            builder.comAtivo('qualquerOutroValor');
            expect(builder.filtros.ativo).toBeUndefined();
        });
    });

    describe('Método comGrupo', () => {
        it('deve retornar o próprio builder quando grupo é nulo ou vazio', async () => {
            const result1 = await builder.comGrupo(null);
            expect(result1).toBe(builder);
            expect(builder.filtros.grupos).toBeUndefined();

            const result2 = await builder.comGrupo('');
            expect(result2).toBe(builder);
            expect(builder.filtros.grupos).toBeUndefined();
        });

        it('deve adicionar filtro por grupo quando valor válido é fornecido e grupos são encontrados', async () => {
            // Mock do repositório de grupo
            const mockGrupoId = new mongoose.Types.ObjectId();
            builder.grupoRepository = {
                buscarPorNome: jest.fn().mockResolvedValue({
                    _id: mockGrupoId
                })
            };

            const result = await builder.comGrupo('Administradores');
            expect(result).toBe(builder);
            expect(builder.filtros.grupos).toEqual({
                $in: [mockGrupoId]
            });
            expect(builder.grupoRepository.buscarPorNome).toHaveBeenCalledWith('Administradores');
        });

        it('deve adicionar filtro com múltiplos IDs quando vários grupos são encontrados', async () => {
            // Mock do repositório de grupo
            const mockGrupoIds = [
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId()
            ];
            builder.grupoRepository = {
                buscarPorNome: jest.fn().mockResolvedValue([{
                        _id: mockGrupoIds[0]
                    },
                    {
                        _id: mockGrupoIds[1]
                    }
                ])
            };

            const result = await builder.comGrupo('Professores');
            expect(result).toBe(builder);
            expect(builder.filtros.grupos).toEqual({
                $in: mockGrupoIds
            });
            expect(builder.grupoRepository.buscarPorNome).toHaveBeenCalledWith('Professores');
        });

        it('deve adicionar filtro com array vazio quando nenhum grupo é encontrado', async () => {
            // Mock do repositório de grupo
            builder.grupoRepository = {
                buscarPorNome: jest.fn().mockResolvedValue(null)
            };

            const result = await builder.comGrupo('GrupoInexistente');
            expect(result).toBe(builder);
            expect(builder.filtros.grupos).toEqual({
                $in: []
            });
            expect(builder.grupoRepository.buscarPorNome).toHaveBeenCalledWith('GrupoInexistente');
        });
    });

    describe('Método comUnidade', () => {
        it('deve retornar o próprio builder quando unidade é nula ou vazia', async () => {
            const result1 = await builder.comUnidade(null);
            expect(result1).toBe(builder);
            expect(builder.filtros.unidades).toBeUndefined();

            const result2 = await builder.comUnidade('');
            expect(result2).toBe(builder);
            expect(builder.filtros.unidades).toBeUndefined();
        });

        it('deve adicionar filtro por unidade quando valor válido é fornecido e unidades são encontradas', async () => {
            // Mock do repositório de unidade
            const mockUnidadeId = new mongoose.Types.ObjectId();
            builder.unidadeRepository = {
                buscarPorNome: jest.fn().mockResolvedValue({
                    _id: mockUnidadeId
                })
            };

            const result = await builder.comUnidade('Unidade Principal');
            expect(result).toBe(builder);
            expect(builder.filtros.unidades).toEqual({
                $in: [mockUnidadeId]
            });
            expect(builder.unidadeRepository.buscarPorNome).toHaveBeenCalledWith('Unidade Principal');
        });

        it('deve adicionar filtro com múltiplos IDs quando várias unidades são encontradas', async () => {
            // Mock do repositório de unidade
            const mockUnidadeIds = [
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId()
            ];
            builder.unidadeRepository = {
                buscarPorNome: jest.fn().mockResolvedValue([{
                        _id: mockUnidadeIds[0]
                    },
                    {
                        _id: mockUnidadeIds[1]
                    }
                ])
            };

            const result = await builder.comUnidade('Filial');
            expect(result).toBe(builder);
            expect(builder.filtros.unidades).toEqual({
                $in: mockUnidadeIds
            });
            expect(builder.unidadeRepository.buscarPorNome).toHaveBeenCalledWith('Filial');
        });

        it('deve adicionar filtro com array vazio quando nenhuma unidade é encontrada', async () => {
            // Mock do repositório de unidade
            builder.unidadeRepository = {
                buscarPorNome: jest.fn().mockResolvedValue(null)
            };

            const result = await builder.comUnidade('UnidadeInexistente');
            expect(result).toBe(builder);
            expect(builder.filtros.unidades).toEqual({
                $in: []
            });
            expect(builder.unidadeRepository.buscarPorNome).toHaveBeenCalledWith('UnidadeInexistente');
        });
    });

    describe('Método escapeRegex', () => {
        it('deve escapar caracteres especiais de expressões regulares', () => {
            const textoComCaracteresEspeciais = 'teste.*+?^${}()|[]\\';
            const resultado = builder.escapeRegex(textoComCaracteresEspeciais);
            expect(resultado).toBe('teste\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
        });

        it('deve manter texto sem caracteres especiais inalterado', () => {
            const textoNormal = 'textoNormal123';
            const resultado = builder.escapeRegex(textoNormal);
            expect(resultado).toBe('textoNormal123');
        });
    });

    describe('Método build', () => {
        it('deve retornar objeto de filtros vazio quando nenhum filtro foi adicionado', () => {
            const filtros = builder.build();
            expect(filtros).toEqual({});
        });

        it('deve retornar objeto de filtros combinando todos os filtros adicionados', () => {
            builder.comNome('João')
                .comEmail('joao@example.com')
                .comAtivo('true');

            const filtros = builder.build();

            expect(filtros).toEqual({
                nome: {
                    $regex: 'João',
                    $options: 'i'
                },
                email: {
                    $regex: 'joao@example.com',
                    $options: 'i'
                },
                ativo: true
            });
        });

        it('deve aplicar apenas os filtros que foram definidos', () => {
            builder.comNome('Maria')
                .comAtivo('false');

            const filtros = builder.build();

            expect(filtros).toEqual({
                nome: {
                    $regex: 'Maria',
                    $options: 'i'
                },
                ativo: false
            });
            expect(filtros.email).toBeUndefined();
        });
    });

    describe('Integração de métodos', () => {
        it('deve permitir encadeamento de todos os métodos e gerar filtro correto', async () => {
            // Mocks dos repositórios
            const mockGrupoId = new mongoose.Types.ObjectId();
            builder.grupoRepository = {
                buscarPorNome: jest.fn().mockResolvedValue({
                    _id: mockGrupoId
                })
            };

            const mockUnidadeId = new mongoose.Types.ObjectId();
            builder.unidadeRepository = {
                buscarPorNome: jest.fn().mockResolvedValue({
                    _id: mockUnidadeId
                })
            };

            // Encadeia os métodos síncronos primeiro
            builder
                .comNome('João')
                .comEmail('joao@example.com')
                .comAtivo('true');

            // Chama os métodos assíncronos sequencialmente
            await builder.comGrupo('Administradores');
            await builder.comUnidade('Unidade Principal');

            // Verifica o filtro final
            const filtroFinal = builder.build();

            expect(filtroFinal).toEqual({
                nome: {
                    $regex: 'João',
                    $options: 'i'
                },
                email: {
                    $regex: 'joao@example.com',
                    $options: 'i'
                },
                ativo: true,
                grupos: {
                    $in: [mockGrupoId]
                },
                unidades: {
                    $in: [mockUnidadeId]
                }
            });
        });
    });
});