import UsuarioModel from '../../models/Usuario.js';
import UsuarioRepository from '../UsuarioRepository.js';

class UsuarioFilterBuilder {
    constructor() {
        this.filtros = {};
        this.usuarioRepository = new UsuarioRepository();
        this.usuarioModel = UsuarioModel;
    }

    comNome(nome) {
        if (nome) {
            this.filtros.nome = {
                $regex: nome,
                $options: 'i'
            };
        }
        return this;
    }

    comEmail(email) {
        if (email) {
            this.filtros.email = {
                $regex: email,
                $options: 'i'
            };
        }
        return this;
    }

    comAtivo(ativo = null) {
        if (ativo === 'true') {
            this.filtros.ativo = true;
        } else if (ativo === 'false') {
            this.filtros.ativo = false;
        }
        return this;
    }

    comEhAdmin(ehAdmin = null) {
        if (ehAdmin === 'true') {
            this.filtros.ehAdmin = true;
        } else if (ehAdmin === 'false') {
            this.filtros.ehAdmin = false;
        }
        return this;
    }

    comDataInicio(dataInicio) {
        if (dataInicio) {
            const data = new Date(dataInicio);
            if (!isNaN(data.getTime())) {
                this.filtros.createdAt = this.filtros.createdAt || {};
                this.filtros.createdAt.$gte = data;
            }
        }
        return this;
    }

    comDataFim(dataFim) {
        if (dataFim) {
            const data = new Date(dataFim);
            if (!isNaN(data.getTime())) {
                
                data.setHours(23, 59, 59, 999);
                this.filtros.createdAt = this.filtros.createdAt || {};
                this.filtros.createdAt.$lte = data;
            }
        }
        return this;
    }

    ordenarPor(campo, direcao = 'asc') {
        const camposValidos = [
            'nome',
            'email',
            'createdAt',
            'updatedAt'
        ];

        if (campo && camposValidos.includes(campo)) {
            const direcaoValida = direcao.toLowerCase() === 'desc' ? -1 : 1;
            this.filtros._sort = {
                [campo]: direcaoValida
            };
        }
        return this;
    }

    async comGrupo(grupo) {
        if (grupo) {
            const gruposEncontrados = await this.grupoRepository.buscarPorNome(grupo);

            const grupoIds = gruposEncontrados ?
                Array.isArray(gruposEncontrados) ?
                gruposEncontrados.map(g => g._id) : [gruposEncontrados._id] : [];

            this.filtros.grupos = {
                $in: grupoIds
            };
        }
        return this;
    }

    async comUnidade(unidade) {
        if (unidade) {
            const unidadesEncontradas = await this.unidadeRepository.buscarPorNome(unidade);

            const unidadeIds = unidadesEncontradas ?
                Array.isArray(unidadesEncontradas) ?
                unidadesEncontradas.map(u => u._id) : [unidadesEncontradas._id] : [];

            this.filtros.unidades = {
                $in: unidadeIds
            };
        }
        return this;
    }

    escapeRegex(texto) {
        return texto.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }

    build() {
        const filtrosEspeciais = {};
        const filtrosNormais = {
            ...this.filtros
        };

        
        if (filtrosNormais._sort) {
            filtrosEspeciais.sort = filtrosNormais._sort;
            delete filtrosNormais._sort;
        }

        
        const temFiltrosEspeciais = Object.keys(filtrosEspeciais).length > 0;

        if (!temFiltrosEspeciais) {
            return filtrosNormais;
        }

        return {
            filtros: filtrosNormais,
            especiais: filtrosEspeciais
        };
    }
}

export default UsuarioFilterBuilder;