import Rota from '../models/Rota.js';
import Grupo from '../models/Grupo.js';

const rotasSeeds = [{
        rota: 'usuarios',
        dominio: 'localhost',
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: 'cursos',
        dominio: 'localhost',
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: 'aulas',
        dominio: 'localhost',
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: 'alternativas',
        dominio: 'localhost',
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: 'questionarios',
        dominio: 'localhost',
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: 'certificados',
        dominio: 'localhost',
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: 'grupos',
        dominio: 'localhost',
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: 'rotas',
        dominio: 'localhost',
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    }
];

const gruposSeeds = [{
        nome: 'Administradores',
        descricao: 'Grupo com acesso administrativo ao sistema',
        ativo: true,
        permissoes: []
    },
    {
        nome: 'Usuários',
        descricao: 'Grupo padrão para usuários comuns',
        ativo: true,
        permissoes: []
    }
];

const criarRotasSeeds = async () => {
    try {
        console.log('Iniciando criação de rotas...');

        for (const rotaData of rotasSeeds) {
            const rotaExistente = await Rota.findOne({
                rota: rotaData.rota,
                dominio: rotaData.dominio
            });

            if (!rotaExistente) {
                await Rota.create(rotaData);
                console.log(`Rota criada: ${rotaData.rota}`);
            } else {
                console.log(`Rota já existe: ${rotaData.rota}`);
            }
        }

        console.log('Rotas criadas com sucesso!');
    } catch (error) {
        console.error('Erro ao criar rotas:', error);
    }
};

const criarGruposSeeds = async () => {
    try {
        console.log('🌱 Iniciando criação de grupos...');

        for (const grupoData of gruposSeeds) {
            const grupoExistente = await Grupo.findOne({
                nome: grupoData.nome
            });

            if (!grupoExistente) {
                await Grupo.create(grupoData);
                console.log(`Grupo criado: ${grupoData.nome}`);
            } else {
                console.log(`Grupo já existe: ${grupoData.nome}`);
            }
        }

        console.log('Grupos criados com sucesso!');
        console.log('ℹUse as rotas /grupos e /rotas para configurar as permissões via API');
    } catch (error) {
        console.error('Erro ao criar grupos:', error);
    }
};

export {
    criarRotasSeeds,
    criarGruposSeeds
};