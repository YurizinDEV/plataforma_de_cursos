import { jest } from '@jest/globals';

// Mock automático das dependências
jest.mock('../../../../repositories/UsuarioRepository.js');
jest.mock('../../../../repositories/GrupoRepository.js');
jest.mock('../../../../models/Usuario.js');

// Agora importamos as dependências e o UsuarioFilterBuilder
import UsuarioFilterBuilder from '../../../../repositories/filters/UsuarioFilterBuilder.js';
import UsuarioRepository from '../../../../repositories/UsuarioRepository.js';
import GrupoRepository from '../../../../repositories/GrupoRepository.js';
import UsuarioModel from '../../../../models/Usuario.js';

describe('UsuarioFilterBuilder', () => {
    let filterBuilder;
    let mockUsuarioRepository;
    let mockGrupoRepository;

    beforeEach(() => {
        // Configurar os mocks
        mockUsuarioRepository = {
            buscarPorFiltro: jest.fn().mockResolvedValue([]),
            buscarPorId: jest.fn().mockResolvedValue(null),
            buscarPorEmail: jest.fn().mockResolvedValue(null)
        };

        mockGrupoRepository = {
            buscarPorNome: jest.fn().mockResolvedValue(null),
            buscarPorId: jest.fn().mockResolvedValue(null),
            listar: jest.fn().mockResolvedValue([])
        };

        // Configurar os mocks para retornar as instâncias mockadas
        UsuarioRepository.mockImplementation(() => mockUsuarioRepository);
        GrupoRepository.mockImplementation(() => mockGrupoRepository);
        
        // Mock do UsuarioModel
        UsuarioModel.find = jest.fn();
        UsuarioModel.findOne = jest.fn();
        UsuarioModel.aggregate = jest.fn();

        filterBuilder = new UsuarioFilterBuilder();
        
        // Mock do unidadeRepository que está sendo usado no método comUnidade
        filterBuilder.unidadeRepository = {
            buscarPorNome: jest.fn().mockResolvedValue(null)
        };
        
        jest.clearAllMocks();
    });

    const extrairFiltros = (resultado) => resultado.filtros || resultado;

    test('deve retornar filtro vazio quando nenhuma condição é aplicada', () => {
        const resultado = filterBuilder.build();
        expect(resultado).toEqual({});
    });

    describe('comNome()', () => {
        test('deve adicionar filtro de nome quando valor é válido', () => {
            filterBuilder.comNome('João');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).toHaveProperty('nome');
            expect(filtro.nome).toHaveProperty('$regex', 'João');
            expect(filtro.nome).toHaveProperty('$options', 'i');
        });

        test('não deve adicionar filtro de nome quando valor é vazio', () => {
            filterBuilder.comNome('');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('nome');
        });

        test('não deve adicionar filtro de nome quando valor é null ou undefined', () => {
            filterBuilder.comNome(null);
            let resultado = filterBuilder.build();
            let filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('nome');

            filterBuilder = new UsuarioFilterBuilder();
            filterBuilder.comNome(undefined);
            resultado = filterBuilder.build();
            filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('nome');
        });
    });

    describe('comEmail()', () => {
        test('deve adicionar filtro de email quando valor é válido', () => {
            filterBuilder.comEmail('test@email.com');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).toHaveProperty('email');
            expect(filtro.email).toHaveProperty('$regex', 'test@email.com');
            expect(filtro.email).toHaveProperty('$options', 'i');
        });

        test('não deve adicionar filtro de email quando valor é vazio', () => {
            filterBuilder.comEmail('');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('email');
        });

        test('não deve adicionar filtro de email quando valor é null ou undefined', () => {
            filterBuilder.comEmail(null);
            let resultado = filterBuilder.build();
            let filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('email');

            filterBuilder = new UsuarioFilterBuilder();
            filterBuilder.comEmail(undefined);
            resultado = filterBuilder.build();
            filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('email');
        });
    });

    describe('comAtivo()', () => {
        test('deve adicionar filtro ativo true', () => {
            filterBuilder.comAtivo('true');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).toHaveProperty('ativo', true);
        });

        test('deve adicionar filtro ativo false', () => {
            filterBuilder.comAtivo('false');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).toHaveProperty('ativo', false);
        });

        test('não deve adicionar filtro de ativo para outros valores', () => {
            filterBuilder.comAtivo('string');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('ativo');
        });

        test('deve usar valor padrão null quando não fornecido', () => {
            filterBuilder.comAtivo(); // sem parâmetro, usa default null
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('ativo');
        });

        test('não deve adicionar filtro quando null explícito', () => {
            filterBuilder.comAtivo(null);
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('ativo');
        });

        test('não deve adicionar filtro quando undefined', () => {
            filterBuilder.comAtivo(undefined);
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('ativo');
        });

        test('deve testar todos os branches do método', () => {
            // Testar o branch 'true'
            filterBuilder.comAtivo('true');
            let resultado = filterBuilder.build();
            let filtro = extrairFiltros(resultado);
            expect(filtro.ativo).toBe(true);

            // Reset e testar o branch 'false'
            filterBuilder = new UsuarioFilterBuilder();
            filterBuilder.unidadeRepository = { buscarPorNome: jest.fn().mockResolvedValue(null) };
            filterBuilder.comAtivo('false');
            resultado = filterBuilder.build();
            filtro = extrairFiltros(resultado);
            expect(filtro.ativo).toBe(false);

            // Reset e testar branch padrão (nenhuma condição atendida)
            filterBuilder = new UsuarioFilterBuilder();
            filterBuilder.unidadeRepository = { buscarPorNome: jest.fn().mockResolvedValue(null) };
            filterBuilder.comAtivo('other');
            resultado = filterBuilder.build();
            filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('ativo');
        });
    });

    describe('comGrupos()', () => {
        test('deve adicionar filtro de grupos quando especificado', async () => {
            const mockGrupo = { _id: 'grupo-id' };
            filterBuilder.grupoRepository.buscarPorNome.mockResolvedValue(mockGrupo);

            await filterBuilder.comGrupos('Administradores');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            
            expect(filtro).toHaveProperty('grupos');
            expect(filtro.grupos).toHaveProperty('$in', ['grupo-id']);
        });

        test('deve adicionar filtro vazio quando grupo não é encontrado', async () => {
            filterBuilder.grupoRepository.buscarPorNome.mockResolvedValue(null);

            await filterBuilder.comGrupos('GrupoInexistente');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            
            expect(filtro).toHaveProperty('grupos');
            expect(filtro.grupos).toHaveProperty('$in', []);
        });

        test('deve não adicionar filtro de grupos quando vazio', async () => {
            await filterBuilder.comGrupos('');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('grupos');
        });

        test('deve não adicionar filtro de grupos quando apenas espaços', async () => {
            await filterBuilder.comGrupos('   ');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('grupos');
        });

        test('não deve adicionar filtro de grupos para valores null', async () => {
            await filterBuilder.comGrupos(null);
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('grupos');
        });

        test('não deve adicionar filtro de grupos para valores undefined', async () => {
            await filterBuilder.comGrupos(undefined);
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('grupos');
        });
    });

    describe('comDataInicio()', () => {
        test('deve adicionar filtro de data início quando data é válida', () => {
            const dataInicio = '2024-01-01';
            filterBuilder.comDataInicio(dataInicio);
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            
            expect(filtro).toHaveProperty('createdAt');
            expect(filtro.createdAt).toHaveProperty('$gte');
            expect(filtro.createdAt.$gte).toBeInstanceOf(Date);
        });

        test('não deve adicionar filtro quando data é inválida', () => {
            filterBuilder.comDataInicio('data-invalida');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            
            expect(filtro).not.toHaveProperty('createdAt');
        });

        test('não deve adicionar filtro quando data é vazia', () => {
            filterBuilder.comDataInicio('');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            
            expect(filtro).not.toHaveProperty('createdAt');
        });

        test('não deve adicionar filtro quando data é null', () => {
            filterBuilder.comDataInicio(null);
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            
            expect(filtro).not.toHaveProperty('createdAt');
        });

        test('deve combinar com filtro de data fim', () => {
            filterBuilder.comDataInicio('2024-01-01');
            filterBuilder.comDataFim('2024-12-31');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            
            expect(filtro).toHaveProperty('createdAt');
            expect(filtro.createdAt).toHaveProperty('$gte');
            expect(filtro.createdAt).toHaveProperty('$lte');
        });
    });

    describe('comDataFim()', () => {
        test('deve adicionar filtro de data fim quando data é válida', () => {
            const dataFim = '2024-12-31';
            filterBuilder.comDataFim(dataFim);
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            
            expect(filtro).toHaveProperty('createdAt');
            expect(filtro.createdAt).toHaveProperty('$lte');
            expect(filtro.createdAt.$lte).toBeInstanceOf(Date);
            
            // Verificar se a hora foi ajustada para 23:59:59.999
            const dataLte = filtro.createdAt.$lte;
            expect(dataLte.getHours()).toBe(23);
            expect(dataLte.getMinutes()).toBe(59);
            expect(dataLte.getSeconds()).toBe(59);
            expect(dataLte.getMilliseconds()).toBe(999);
        });

        test('não deve adicionar filtro quando data é inválida', () => {
            filterBuilder.comDataFim('data-invalida');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            
            expect(filtro).not.toHaveProperty('createdAt');
        });

        test('não deve adicionar filtro quando data é vazia', () => {
            filterBuilder.comDataFim('');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            
            expect(filtro).not.toHaveProperty('createdAt');
        });

        test('não deve adicionar filtro quando data é null', () => {
            filterBuilder.comDataFim(null);
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            
            expect(filtro).not.toHaveProperty('createdAt');
        });
    });

    describe('ordenarPor()', () => {
        test('deve adicionar ordenação por campo válido em ordem crescente', () => {
            filterBuilder.ordenarPor('nome', 'asc');
            const resultado = filterBuilder.build();
            
            expect(resultado).toHaveProperty('especiais');
            expect(resultado.especiais).toHaveProperty('sort');
            expect(resultado.especiais.sort).toHaveProperty('nome', 1);
        });

        test('deve adicionar ordenação em ordem decrescente', () => {
            filterBuilder.ordenarPor('email', 'desc');
            const resultado = filterBuilder.build();
            
            expect(resultado).toHaveProperty('especiais');
            expect(resultado.especiais).toHaveProperty('sort');
            expect(resultado.especiais.sort).toHaveProperty('email', -1);
        });

        test('deve usar ordem crescente como padrão', () => {
            filterBuilder.ordenarPor('createdAt');
            const resultado = filterBuilder.build();
            
            expect(resultado).toHaveProperty('especiais');
            expect(resultado.especiais).toHaveProperty('sort');
            expect(resultado.especiais.sort).toHaveProperty('createdAt', 1);
        });

        test('deve aceitar todos os campos válidos', () => {
            const camposValidos = ['nome', 'email', 'createdAt', 'updatedAt'];
            
            camposValidos.forEach(campo => {
                const builder = new UsuarioFilterBuilder();
                builder.ordenarPor(campo);
                const resultado = builder.build();
                
                expect(resultado).toHaveProperty('especiais');
                expect(resultado.especiais).toHaveProperty('sort');
                expect(resultado.especiais.sort).toHaveProperty(campo, 1);
            });
        });

        test('não deve adicionar ordenação para campo inválido', () => {
            filterBuilder.ordenarPor('campoInvalido');
            const resultado = filterBuilder.build();
            
            // Deve retornar apenas filtros normais
            expect(resultado).not.toHaveProperty('especiais');
        });

        test('não deve adicionar ordenação quando campo é vazio', () => {
            filterBuilder.ordenarPor('');
            const resultado = filterBuilder.build();
            
            expect(resultado).not.toHaveProperty('especiais');
        });

        test('não deve adicionar ordenação quando campo é null', () => {
            filterBuilder.ordenarPor(null);
            const resultado = filterBuilder.build();
            
            expect(resultado).not.toHaveProperty('especiais');
        });

        test('deve tratar direção em maiúscula', () => {
            filterBuilder.ordenarPor('nome', 'DESC');
            const resultado = filterBuilder.build();
            
            expect(resultado).toHaveProperty('especiais');
            expect(resultado.especiais).toHaveProperty('sort');
            expect(resultado.especiais.sort).toHaveProperty('nome', -1);
        });
    });

    describe('comUnidade()', () => {
        test('deve adicionar filtro quando encontra unidade única', async () => {
            const mockUnidade = { _id: 'unidade-id-1' };
            filterBuilder.unidadeRepository.buscarPorNome.mockResolvedValue(mockUnidade);

            await filterBuilder.comUnidade('UnidadeTeste');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            
            expect(filterBuilder.unidadeRepository.buscarPorNome).toHaveBeenCalledWith('UnidadeTeste');
            expect(filtro).toHaveProperty('unidades');
            expect(filtro.unidades).toHaveProperty('$in', ['unidade-id-1']);
        });

        test('deve adicionar filtro quando encontra múltiplas unidades', async () => {
            const mockUnidades = [
                { _id: 'unidade-id-1' },
                { _id: 'unidade-id-2' }
            ];
            filterBuilder.unidadeRepository.buscarPorNome.mockResolvedValue(mockUnidades);

            await filterBuilder.comUnidade('UnidadeTeste');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            
            expect(filtro).toHaveProperty('unidades');
            expect(filtro.unidades).toHaveProperty('$in', ['unidade-id-1', 'unidade-id-2']);
        });

        test('deve adicionar filtro vazio quando não encontra unidades', async () => {
            filterBuilder.unidadeRepository.buscarPorNome.mockResolvedValue(null);

            await filterBuilder.comUnidade('UnidadeInexistente');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            
            expect(filtro).toHaveProperty('unidades');
            expect(filtro.unidades).toHaveProperty('$in', []);
        });

        test('não deve adicionar filtro quando unidade é vazia', async () => {
            const resultado = await filterBuilder.comUnidade('');
            expect(resultado).toBe(filterBuilder);
            
            const build = filterBuilder.build();
            const filtro = extrairFiltros(build);
            expect(filtro).not.toHaveProperty('unidades');
        });

        test('não deve adicionar filtro quando unidade é null', async () => {
            const resultado = await filterBuilder.comUnidade(null);
            expect(resultado).toBe(filterBuilder);
            
            const build = filterBuilder.build();
            const filtro = extrairFiltros(build);
            expect(filtro).not.toHaveProperty('unidades');
        });

        test('não deve adicionar filtro quando unidade é undefined', async () => {
            const resultado = await filterBuilder.comUnidade(undefined);
            expect(resultado).toBe(filterBuilder);
            
            const build = filterBuilder.build();
            const filtro = extrairFiltros(build);
            expect(filtro).not.toHaveProperty('unidades');
        });

        test('deve permitir encadeamento de método', async () => {
            const mockUnidade = { _id: 'unidade-id' };
            filterBuilder.unidadeRepository.buscarPorNome.mockResolvedValue(mockUnidade);

            const result = await filterBuilder
                .comNome('João')
                .comUnidade('UnidadeTeste');
            
            expect(result).toBe(filterBuilder);
            
            const build = filterBuilder.build();
            const filtro = extrairFiltros(build);
            expect(filtro).toHaveProperty('nome');
            expect(filtro).toHaveProperty('unidades');
        });
    });

    describe('escapeRegex()', () => {
        test('deve escapar caracteres especiais de regex', () => {
            const textoComCaracteresEspeciais = 'test[regex].*+?{}()^$|#\\';
            const textoEscapado = filterBuilder.escapeRegex(textoComCaracteresEspeciais);
            
            expect(textoEscapado).toBe('test\\[regex\\]\\.\\*\\+\\?\\{\\}\\(\\)\\^\\$\\|\\#\\\\');
        });

        test('deve retornar texto normal sem modificações', () => {
            const textoNormal = 'textoSemCaracteresEspeciais123';
            const textoEscapado = filterBuilder.escapeRegex(textoNormal);
            
            expect(textoEscapado).toBe(textoNormal);
        });

        test('deve escapar espaços em branco', () => {
            const textoComEspacos = 'texto com espacos';
            const textoEscapado = filterBuilder.escapeRegex(textoComEspacos);
            
            expect(textoEscapado).toBe('texto\\ com\\ espacos');
        });

        test('deve tratar string vazia', () => {
            const textoVazio = '';
            const textoEscapado = filterBuilder.escapeRegex(textoVazio);
            
            expect(textoEscapado).toBe('');
        });
    });

    describe('build() - Casos edge adicionais', () => {
        test('deve retornar filtros normais quando não há filtros especiais', () => {
            filterBuilder.comNome('João');
            filterBuilder.comEmail('joao@teste.com');
            filterBuilder.comAtivo('true');
            
            const resultado = filterBuilder.build();
            
            expect(resultado).toHaveProperty('nome');
            expect(resultado).toHaveProperty('email');
            expect(resultado).toHaveProperty('ativo', true);
            expect(resultado).not.toHaveProperty('filtros');
            expect(resultado).not.toHaveProperty('especiais');
        });

        test('deve retornar estrutura com filtros e especiais quando há ordenação', () => {
            filterBuilder.comNome('João');
            filterBuilder.ordenarPor('nome', 'desc');
            
            const resultado = filterBuilder.build();
            
            expect(resultado).toHaveProperty('filtros');
            expect(resultado).toHaveProperty('especiais');
            expect(resultado.filtros).toHaveProperty('nome');
            expect(resultado.especiais).toHaveProperty('sort');
            expect(resultado.especiais.sort).toHaveProperty('nome', -1);
        });

        test('deve combinar múltiplos filtros normais e especiais', () => {
            filterBuilder.comNome('João');
            filterBuilder.comEmail('joao@teste.com');
            filterBuilder.comDataInicio('2024-01-01');
            filterBuilder.comDataFim('2024-12-31');
            filterBuilder.ordenarPor('createdAt', 'desc');
            
            const resultado = filterBuilder.build();
            
            expect(resultado).toHaveProperty('filtros');
            expect(resultado).toHaveProperty('especiais');
            
            // Verificar filtros normais
            expect(resultado.filtros).toHaveProperty('nome');
            expect(resultado.filtros).toHaveProperty('email');
            expect(resultado.filtros).toHaveProperty('createdAt');
            expect(resultado.filtros.createdAt).toHaveProperty('$gte');
            expect(resultado.filtros.createdAt).toHaveProperty('$lte');
            
            // Verificar filtros especiais
            expect(resultado.especiais).toHaveProperty('sort');
            expect(resultado.especiais.sort).toHaveProperty('createdAt', -1);
        });
    });

    describe('Casos edge e cobertura adicional', () => {
        test('deve permitir encadeamento com valores nulos', () => {
            const result = filterBuilder
                .comNome('')
                .comEmail(null)
                .comAtivo('invalid')
                .ordenarPor('', 'asc');
            
            expect(result).toBe(filterBuilder);
            
            const resultado = filterBuilder.build();
            expect(Object.keys(resultado)).toHaveLength(0);
        });

        test('deve lidar com data de início e fim em sequência', () => {
            filterBuilder
                .comDataInicio('2024-01-01T00:00:00Z')
                .comDataFim('2024-12-31T00:00:00Z');
            
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            
            expect(filtro).toHaveProperty('createdAt');
            expect(filtro.createdAt).toHaveProperty('$gte');
            expect(filtro.createdAt).toHaveProperty('$lte');
            
            // Data fim deve ter hora ajustada
            const dataFim = filtro.createdAt.$lte;
            expect(dataFim.getHours()).toBe(23);
            expect(dataFim.getMinutes()).toBe(59);
        });

        test('deve resetar builder para novo uso', () => {
            // Primeiro uso
            filterBuilder.comNome('João').comEmail('joao@teste.com');
            let resultado = filterBuilder.build();
            let filtro = extrairFiltros(resultado);
            
            expect(filtro).toHaveProperty('nome');
            expect(filtro).toHaveProperty('email');
            
            // Criar novo builder (simular reset)
            filterBuilder = new UsuarioFilterBuilder();
            filterBuilder.comAtivo('false');
            resultado = filterBuilder.build();
            filtro = extrairFiltros(resultado);
            
            expect(filtro).toHaveProperty('ativo', false);
            expect(filtro).not.toHaveProperty('nome');
            expect(filtro).not.toHaveProperty('email');
        });

        test('deve tratar grupos com espaços corretamente', async () => {
            const mockGrupo = { _id: 'admin-id' };
            filterBuilder.grupoRepository.buscarPorNome.mockResolvedValue(mockGrupo);
            
            await filterBuilder.comGrupos('  Administradores  ');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            
            expect(filterBuilder.grupoRepository.buscarPorNome).toHaveBeenCalledWith('Administradores');
            expect(filtro).toHaveProperty('grupos');
            expect(filtro.grupos).toHaveProperty('$in', ['admin-id']);
        });
    });

    describe('build()', () => {
        test('deve retornar apenas filtros normais se não houver especiais', () => {
            filterBuilder.comNome('João');
            filterBuilder.comEmail('joao@teste.com');
            const resultado = filterBuilder.build();
            
            expect(resultado).toHaveProperty('nome');
            expect(resultado).toHaveProperty('email');
        });

        test('deve retornar estrutura completa se houver especiais', () => {
            filterBuilder.comNome('João');
            filterBuilder.ordenarPor('nome', 'desc');
            const resultado = filterBuilder.build();
            
            expect(resultado).toHaveProperty('filtros');
            expect(resultado).toHaveProperty('especiais');
            expect(resultado.filtros).toHaveProperty('nome');
            expect(resultado.especiais).toHaveProperty('sort');
        });
    });

    describe('encadeamento de métodos', () => {
        test('deve permitir chaining de métodos síncronos', () => {
            const result = filterBuilder
                .comNome('João')
                .comEmail('joao@teste.com')
                .comAtivo('true');
            
            expect(result).toBe(filterBuilder);
            
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).toHaveProperty('nome');
            expect(filtro).toHaveProperty('email');
            expect(filtro).toHaveProperty('ativo', true);
        });

        test('deve permitir chaining com métodos assíncronos', async () => {
            // Mock para simular grupo encontrado
            const mockGrupo = { _id: 'admin-group-id' };
            filterBuilder.grupoRepository.buscarPorNome.mockResolvedValue(mockGrupo);
            
            await filterBuilder
                .comNome('João')
                .comEmail('joao@teste.com')
                .comAtivo('true')
                .comGrupos('Administradores');
                
            const resultado = filterBuilder.build();
            expect(resultado).toHaveProperty('nome');
            expect(resultado).toHaveProperty('email');
            expect(resultado).toHaveProperty('ativo', true);
            expect(resultado).toHaveProperty('grupos');
        });
    });
});