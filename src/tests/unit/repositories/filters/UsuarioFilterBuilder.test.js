import UsuarioFilterBuilder from '../../../../repositories/filters/UsuarioFilterBuilder.js';

describe('UsuarioFilterBuilder', () => {
    let filterBuilder;

    beforeEach(() => {
        filterBuilder = new UsuarioFilterBuilder();
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
            filterBuilder.comEmail('teste@dominio.com');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).toHaveProperty('email');
            expect(filtro.email).toHaveProperty('$regex', 'teste@dominio.com');
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
            filterBuilder.comAtivo('qualquer');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('ativo');
        });
    });

    describe('comEhAdmin()', () => {
        test('deve adicionar filtro ehAdmin true', () => {
            filterBuilder.comEhAdmin('true');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).toHaveProperty('ehAdmin', true);
        });
        test('deve adicionar filtro ehAdmin false', () => {
            filterBuilder.comEhAdmin('false');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).toHaveProperty('ehAdmin', false);
        });
        test('não deve adicionar filtro de ehAdmin para outros valores', () => {
            filterBuilder.comEhAdmin('qualquer');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('ehAdmin');
        });
    });

    describe('comDataInicio()', () => {
        test('deve adicionar filtro createdAt.$gte para data válida', () => {
            filterBuilder.comDataInicio('2024-01-01');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).toHaveProperty('createdAt');
            expect(filtro.createdAt).toHaveProperty('$gte');
            expect(new Date(filtro.createdAt.$gte).toISOString().startsWith('2024-01-01')).toBe(true);
        });
        test('não deve adicionar filtro para data inválida', () => {
            filterBuilder.comDataInicio('data-invalida');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('createdAt');
        });
        test('não deve adicionar filtro para valor vazio', () => {
            filterBuilder.comDataInicio('');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('createdAt');
        });
    });

    describe('comDataFim()', () => {
        test('deve adicionar filtro createdAt.$lte para data válida', () => {
            filterBuilder.comDataFim('2024-12-31');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).toHaveProperty('createdAt');
            expect(filtro.createdAt).toHaveProperty('$lte');
            expect(new Date(filtro.createdAt.$lte).getFullYear()).toBe(2024);
        });
        test('não deve adicionar filtro para data inválida', () => {
            filterBuilder.comDataFim('data-invalida');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('createdAt');
        });
        test('não deve adicionar filtro para valor vazio', () => {
            filterBuilder.comDataFim('');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('createdAt');
        });
    });

    describe('ordenarPor()', () => {
        test('deve adicionar filtro de ordenação ascendente', () => {
            filterBuilder.ordenarPor('nome', 'asc');
            const resultado = filterBuilder.build();
            expect(resultado).toHaveProperty('filtros');
            expect(resultado).toHaveProperty('especiais');
            expect(resultado.especiais).toHaveProperty('sort');
            expect(resultado.especiais.sort).toHaveProperty('nome', 1);
        });
        test('deve adicionar filtro de ordenação descendente', () => {
            filterBuilder.ordenarPor('email', 'desc');
            const resultado = filterBuilder.build();
            expect(resultado.especiais.sort).toHaveProperty('email', -1);
        });
        test('não deve adicionar filtro de ordenação para campo inválido', () => {
            filterBuilder.ordenarPor('campoInvalido', 'asc');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('_sort');
            expect(resultado).not.toHaveProperty('especiais');
        });
        test('deve usar ascendente como padrão se direcao não for informada', () => {
            filterBuilder.ordenarPor('nome');
            const resultado = filterBuilder.build();
            expect(resultado.especiais.sort).toHaveProperty('nome', 1);
        });
        test('deve ignorar direcao inválida e usar ascendente', () => {
            filterBuilder.ordenarPor('nome', 'qualquer');
            const resultado = filterBuilder.build();
            expect(resultado.especiais.sort).toHaveProperty('nome', 1);
        });
    });

    describe('build()', () => {
        test('deve retornar apenas filtros normais se não houver especiais', () => {
            filterBuilder.comNome('João');
            const resultado = filterBuilder.build();
            expect(resultado).toHaveProperty('nome');
            expect(resultado).not.toHaveProperty('filtros');
            expect(resultado).not.toHaveProperty('especiais');
        });
        test('deve retornar estrutura completa se houver especiais', () => {
            filterBuilder.ordenarPor('nome', 'desc');
            filterBuilder.comNome('João');
            const resultado = filterBuilder.build();
            expect(resultado).toHaveProperty('filtros');
            expect(resultado).toHaveProperty('especiais');
            expect(resultado.filtros).toHaveProperty('nome');
            expect(resultado.especiais.sort).toHaveProperty('nome', -1);
        });
    });

    describe('encadeamento de métodos', () => {
        test('deve permitir chaining de todos os métodos', () => {
            filterBuilder
                .comNome('João')
                .comEmail('joao@teste.com')
                .comAtivo('true')
                .comEhAdmin('false')
                .comDataInicio('2024-01-01')
                .comDataFim('2024-12-31')
                .ordenarPor('nome', 'desc');
            const resultado = filterBuilder.build();
            expect(resultado.filtros).toHaveProperty('nome');
            expect(resultado.filtros).toHaveProperty('email');
            expect(resultado.filtros).toHaveProperty('ativo', true);
            expect(resultado.filtros).toHaveProperty('ehAdmin', false);
            expect(resultado.filtros).toHaveProperty('createdAt');
            expect(resultado.especiais.sort).toHaveProperty('nome', -1);
        });
    });

    describe('branches e casos edge', () => {
        test('deve ignorar valores inválidos em todos os métodos', () => {
            filterBuilder
                .comNome('')
                .comEmail('')
                .comAtivo('talvez')
                .comEhAdmin('sim')
                .comDataInicio('data-invalida')
                .comDataFim('data-invalida')
                .ordenarPor('campoInvalido', 'desc');
            const resultado = filterBuilder.build();
            expect(resultado).toEqual({});
        });
        test('deve permitir resetar filtros criando nova instância', () => {
            filterBuilder.comNome('João');
            let resultado = filterBuilder.build();
            expect(resultado).toHaveProperty('nome');
            filterBuilder = new UsuarioFilterBuilder();
            resultado = filterBuilder.build();
            expect(resultado).toEqual({});
        });
    });

    describe('comDataInicio() e comDataFim() - combinação', () => {
        test('deve combinar filtros de data início e fim', () => {
            filterBuilder.comDataInicio('2024-01-01').comDataFim('2024-12-31');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).toHaveProperty('createdAt');
            expect(filtro.createdAt).toHaveProperty('$gte');
            expect(filtro.createdAt).toHaveProperty('$lte');
        });

        test('deve adicionar hora 23:59:59 na data fim', () => {
            filterBuilder.comDataFim('2024-12-31');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            const dataFim = new Date(filtro.createdAt.$lte);
            expect(dataFim.getHours()).toBe(23);
            expect(dataFim.getMinutes()).toBe(59);
            expect(dataFim.getSeconds()).toBe(59);
            expect(dataFim.getMilliseconds()).toBe(999);
        });
    });

    describe('métodos assíncronos', () => {
        test('deve testar comGrupo com valor vazio', async () => {
            await filterBuilder.comGrupo('');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('grupos');
        });

        test('deve testar comGrupo com valor null', async () => {
            await filterBuilder.comGrupo(null);
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('grupos');
        });

        test('deve testar comUnidade com valor vazio', async () => {
            await filterBuilder.comUnidade('');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('unidades');
        });

        test('deve testar comUnidade com valor null', async () => {
            await filterBuilder.comUnidade(null);
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);
            expect(filtro).not.toHaveProperty('unidades');
        });
    });

    describe('escapeRegex()', () => {
        test('deve escapar caracteres especiais de regex', () => {
            const texto = 'test[]{}-+*?.\\^$|#';
            const resultado = filterBuilder.escapeRegex(texto);
            expect(resultado).toBe('test\\[\\]\\{\\}\\-\\+\\*\\?\\.\\\\\\^\\$\\|\\#');
        });

        test('deve retornar texto normal inalterado', () => {
            const texto = 'textoNormal123';
            const resultado = filterBuilder.escapeRegex(texto);
            expect(resultado).toBe('textoNormal123');
        });

        test('deve escapar espaços em branco', () => {
            const texto = 'texto com espaços';
            const resultado = filterBuilder.escapeRegex(texto);
            expect(resultado).toBe('texto\\ com\\ espaços');
        });
    });

    describe('ordenarPor() - campos válidos', () => {
        test('deve aceitar campo createdAt', () => {
            filterBuilder.ordenarPor('createdAt', 'desc');
            const resultado = filterBuilder.build();
            expect(resultado.especiais.sort).toHaveProperty('createdAt', -1);
        });

        test('deve aceitar campo updatedAt', () => {
            filterBuilder.ordenarPor('updatedAt', 'asc');
            const resultado = filterBuilder.build();
            expect(resultado.especiais.sort).toHaveProperty('updatedAt', 1);
        });

        test('deve rejeitar campo não válido', () => {
            filterBuilder.ordenarPor('campoInexistente', 'desc');
            const resultado = filterBuilder.build();
            expect(resultado).toEqual({});
        });

        test('deve funcionar sem direcao especificada', () => {
            filterBuilder.ordenarPor('nome');
            const resultado = filterBuilder.build();
            expect(resultado.especiais.sort).toHaveProperty('nome', 1);
        });
    });

    describe('build() - estruturas complexas', () => {
        test('deve retornar estrutura especial quando há ordenação', () => {
            filterBuilder.ordenarPor('nome', 'desc');
            const resultado = filterBuilder.build();
            expect(resultado).toHaveProperty('filtros');
            expect(resultado).toHaveProperty('especiais');
            expect(resultado.especiais).toHaveProperty('sort');
            expect(Object.keys(resultado.filtros)).toHaveLength(0);
        });

        test('deve retornar estrutura normal quando não há filtros especiais', () => {
            filterBuilder.comNome('João').comEmail('teste@email.com');
            const resultado = filterBuilder.build();
            expect(resultado).not.toHaveProperty('filtros');
            expect(resultado).not.toHaveProperty('especiais');
            expect(resultado).toHaveProperty('nome');
            expect(resultado).toHaveProperty('email');
        });

        test('deve combinar filtros normais e especiais', () => {
            filterBuilder
                .comNome('João')
                .comAtivo('true')
                .ordenarPor('email', 'desc');
            const resultado = filterBuilder.build();
            expect(resultado).toHaveProperty('filtros');
            expect(resultado).toHaveProperty('especiais');
            expect(resultado.filtros).toHaveProperty('nome');
            expect(resultado.filtros).toHaveProperty('ativo', true);
            expect(resultado.especiais.sort).toHaveProperty('email', -1);
        });
    });

    describe('validação de tipos e valores', () => {
        test('deve lidar com valores falsy em comNome', () => {
            filterBuilder.comNome(0);
            const resultado = filterBuilder.build();
            expect(resultado).toEqual({});
        });

        test('deve lidar com valores falsy em comEmail', () => {
            filterBuilder.comEmail(false);
            const resultado = filterBuilder.build();
            expect(resultado).toEqual({});
        });

        test('deve lidar com string vazia em comAtivo', () => {
            filterBuilder.comAtivo('');
            const resultado = filterBuilder.build();
            expect(resultado).toEqual({});
        });

        test('deve lidar com string vazia em comEhAdmin', () => {
            filterBuilder.comEhAdmin('');
            const resultado = filterBuilder.build();
            expect(resultado).toEqual({});
        });

        test('deve funcionar com direcao em maiúscula', () => {
            filterBuilder.ordenarPor('nome', 'DESC');
            const resultado = filterBuilder.build();
            expect(resultado.especiais.sort).toHaveProperty('nome', -1);
        });

        test('deve funcionar com direcao mista', () => {
            filterBuilder.ordenarPor('nome', 'DeSc');
            const resultado = filterBuilder.build();
            expect(resultado.especiais.sort).toHaveProperty('nome', -1);
        });
    });

    describe('isolamento de instâncias', () => {
        test('deve manter estado isolado entre instâncias diferentes', () => {
            const builder1 = new UsuarioFilterBuilder();
            const builder2 = new UsuarioFilterBuilder();

            builder1.comNome('João');
            builder2.comEmail('maria@teste.com');

            const resultado1 = builder1.build();
            const resultado2 = builder2.build();

            expect(resultado1).toHaveProperty('nome');
            expect(resultado1).not.toHaveProperty('email');
            expect(resultado2).toHaveProperty('email');
            expect(resultado2).not.toHaveProperty('nome');
        });
    });

    describe('métodos assíncronos com mocks', () => {
        beforeEach(() => {

            filterBuilder.grupoRepository = {
                buscarPorNome: jest.fn()
            };
            filterBuilder.unidadeRepository = {
                buscarPorNome: jest.fn()
            };
        });

        test('deve adicionar filtro de grupo quando encontrado como array', async () => {
            const mockGrupos = [{
                    _id: 'grupo1'
                },
                {
                    _id: 'grupo2'
                }
            ];
            filterBuilder.grupoRepository.buscarPorNome.mockResolvedValue(mockGrupos);

            await filterBuilder.comGrupo('Grupo Teste');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('grupos');
            expect(filtro.grupos).toHaveProperty('$in');
            expect(filtro.grupos.$in).toEqual(['grupo1', 'grupo2']);
        });

        test('deve adicionar filtro de grupo quando encontrado como objeto único', async () => {
            const mockGrupo = {
                _id: 'grupo1'
            };
            filterBuilder.grupoRepository.buscarPorNome.mockResolvedValue(mockGrupo);

            await filterBuilder.comGrupo('Grupo Teste');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('grupos');
            expect(filtro.grupos).toHaveProperty('$in');
            expect(filtro.grupos.$in).toEqual(['grupo1']);
        });

        test('deve adicionar filtro vazio quando grupo não encontrado', async () => {
            filterBuilder.grupoRepository.buscarPorNome.mockResolvedValue(null);

            await filterBuilder.comGrupo('Grupo Inexistente');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('grupos');
            expect(filtro.grupos).toHaveProperty('$in');
            expect(filtro.grupos.$in).toEqual([]);
        });

        test('deve adicionar filtro de unidade quando encontrada como array', async () => {
            const mockUnidades = [{
                    _id: 'unidade1'
                },
                {
                    _id: 'unidade2'
                }
            ];
            filterBuilder.unidadeRepository.buscarPorNome.mockResolvedValue(mockUnidades);

            await filterBuilder.comUnidade('Unidade Teste');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('unidades');
            expect(filtro.unidades).toHaveProperty('$in');
            expect(filtro.unidades.$in).toEqual(['unidade1', 'unidade2']);
        });

        test('deve adicionar filtro de unidade quando encontrada como objeto único', async () => {
            const mockUnidade = {
                _id: 'unidade1'
            };
            filterBuilder.unidadeRepository.buscarPorNome.mockResolvedValue(mockUnidade);

            await filterBuilder.comUnidade('Unidade Teste');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('unidades');
            expect(filtro.unidades).toHaveProperty('$in');
            expect(filtro.unidades.$in).toEqual(['unidade1']);
        });

        test('deve adicionar filtro vazio quando unidade não encontrada', async () => {
            filterBuilder.unidadeRepository.buscarPorNome.mockResolvedValue(null);

            await filterBuilder.comUnidade('Unidade Inexistente');
            const resultado = filterBuilder.build();
            const filtro = extrairFiltros(resultado);

            expect(filtro).toHaveProperty('unidades');
            expect(filtro.unidades).toHaveProperty('$in');
            expect(filtro.unidades.$in).toEqual([]);
        });
    });
});