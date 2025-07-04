// src/repositories/filters/CursoFilterBuilder.js
import CursoModel from '../../models/Curso.js';

class CursoFilterBuilder {
    constructor() {
        this.filtros = {};
        this.orConditions = [];
        this.cursoModel = CursoModel;
    }


    _addOrCondition(condition) {
        this.orConditions.push(condition);
        return this;
    }
    comTitulo(titulo) {
        if (titulo && titulo.trim() !== '') {
            this.filtros.titulo = {
                $regex: titulo,
                $options: 'i'
            };
        }
        return this;
    }

    comTags(tags) {

        if (tags && (Array.isArray(tags) ? tags.length > 0 : true)) {
            const tagsArray = Array.isArray(tags) ? tags : [tags];

            const filteredTags = tagsArray.filter(tag => tag && tag.trim() !== '');
            if (filteredTags.length > 0) {

                const firstTag = filteredTags[0];
                if (typeof firstTag === 'string') {


                    let andTags = null;

                    if (firstTag.includes('+') || firstTag.includes('%2B')) {

                        andTags = firstTag.replace(/%2B/gi, '+').split('+');
                    } else if (firstTag.includes('&') || firstTag.includes('%26')) {

                        andTags = firstTag.replace(/%26/gi, '&').split('&');
                    } else if (firstTag.includes('|AND|')) {

                        andTags = firstTag.split('|AND|');
                    }

                    if (andTags && andTags.length > 1) {

                        const cleanTags = andTags.map(tag => tag.trim()).filter(tag => tag !== '');
                        this.filtros.tags = {
                            $all: cleanTags
                        };
                    } else {

                        this.filtros.tags = {
                            $in: filteredTags
                        };
                    }
                } else {

                    this.filtros.tags = {
                        $in: filteredTags
                    };
                }
            }
        }
        return this;
    }


    comTodasTags(tags) {
        if (tags && (Array.isArray(tags) ? tags.length > 0 : true)) {
            const tagsArray = Array.isArray(tags) ? tags : [tags];
            const filteredTags = tagsArray.filter(tag => tag && tag.trim() !== '');
            if (filteredTags.length > 0) {
                this.filtros.tags = {
                    $all: filteredTags
                };
            }
        }
        return this;
    }


    comQualquerTag(tags) {
        return this.comTags(tags);
    }

    comProfessores(professores) {

        if (professores && (Array.isArray(professores) ? professores.length > 0 : true)) {
            const professoresArray = Array.isArray(professores) ? professores : [professores];

            const filteredProfessores = professoresArray.filter(prof => prof && prof.trim() !== '');
            if (filteredProfessores.length > 0) {

                const firstProf = filteredProfessores[0];
                if (typeof firstProf === 'string') {


                    let andProfessores = null;

                    if (firstProf.includes('+') || firstProf.includes('%2B')) {

                        andProfessores = firstProf.replace(/%2B/gi, '+').split('+');
                    } else if (firstProf.includes('&') || firstProf.includes('%26')) {

                        andProfessores = firstProf.replace(/%26/gi, '&').split('&');
                    } else if (firstProf.includes('|AND|')) {

                        andProfessores = firstProf.split('|AND|');
                    }

                    if (andProfessores && andProfessores.length > 1) {

                        const cleanProfessores = andProfessores.map(prof => prof.trim()).filter(prof => prof !== '');
                        this.filtros.professores = {
                            $all: cleanProfessores
                        };
                    } else {

                        this.filtros.professores = {
                            $in: filteredProfessores
                        };
                    }
                } else {

                    this.filtros.professores = {
                        $in: filteredProfessores
                    };
                }
            }
        }
        return this;
    }


    comTodosProfessores(professores) {
        if (professores && (Array.isArray(professores) ? professores.length > 0 : true)) {
            const professoresArray = Array.isArray(professores) ? professores : [professores];
            const filteredProfessores = professoresArray.filter(prof => prof && prof.trim() !== '');
            if (filteredProfessores.length > 0) {
                this.filtros.professores = {
                    $all: filteredProfessores
                };
            }
        }
        return this;
    }


    comQualquerProfessor(professores) {
        return this.comProfessores(professores);
    }
    comCargaHoraria(min, max) {

        const minValid = min && !isNaN(parseInt(min));
        const maxValid = max && !isNaN(parseInt(max));

        if (minValid || maxValid) {
            this.filtros.cargaHorariaTotal = {};

            if (minValid) {
                this.filtros.cargaHorariaTotal.$gte = parseInt(min);
            }

            if (maxValid) {
                this.filtros.cargaHorariaTotal.$lte = parseInt(max);
            }
        }
        return this;
    }


    comId(id) {
        if (id) {
            this.filtros._id = id;
        }
        return this;
    }

    comCriadoPor(usuarioId) {
        if (usuarioId) {
            if (typeof usuarioId === 'string' && usuarioId.trim() !== '') {
                this.filtros.criadoPorId = usuarioId;
            } else if (typeof usuarioId === 'object' && usuarioId !== null) {
                this.filtros.criadoPorId = usuarioId;
            }
        }
        return this;
    }

    criadoPor(usuarioId) {
        return this.comCriadoPor(usuarioId);
    }

    comDataInicio(data) {
        if (typeof data === 'string' && data.trim() !== '') {
            const d = new Date(data);
            if (!isNaN(d.getTime())) {
                this.filtros.createdAt = {
                    ...this.filtros.createdAt,
                    $gte: d
                };
            }
        }
        return this;
    }
    comDataFim(data) {
        if (typeof data === 'string' && data.trim() !== '') {
            const d = new Date(data);
            if (!isNaN(d.getTime())) {
                this.filtros.createdAt = {
                    ...this.filtros.createdAt,
                    $lte: d
                };
            }
        }
        return this;
    }


    aplicarFiltroPadrao() {
        this.filtros.status = 'ativo';
        return this;
    }


    comTituloExato(titulo) {
        if (titulo && titulo.trim() !== '') {
            this.filtros.titulo = titulo.trim();
        }
        return this;
    }


    comDescricao(descricao) {
        if (descricao && descricao.trim() !== '') {
            this.filtros.descricao = {
                $regex: descricao,
                $options: 'i'
            };
        }
        return this;
    }


    comBuscaGeral(termo) {
        if (termo && termo.trim() !== '') {
            const regex = {
                $regex: termo,
                $options: 'i'
            };
            this.filtros.$or = [{
                    titulo: regex
                },
                {
                    descricao: regex
                },
                {
                    tags: {
                        $in: [new RegExp(termo, 'i')]
                    }
                }
            ];
        }
        return this;
    }


    criadoApos(data) {
        if (typeof data === 'string' && data.trim() !== '') {
            const d = new Date(data);
            if (!isNaN(d.getTime())) {
                this.filtros.createdAt = {
                    ...this.filtros.createdAt,
                    $gte: d
                };
            }
        }
        return this;
    }
    criadoAntes(data) {
        if (typeof data === 'string' && data.trim() !== '') {
            const d = new Date(data);
            if (!isNaN(d.getTime())) {
                this.filtros.createdAt = {
                    ...this.filtros.createdAt,
                    $lte: d
                };
            }
        }
        return this;
    }

    atualizadoApos(data) {
        if (data) {
            this.filtros.updatedAt = {
                ...this.filtros.updatedAt,
                $gte: new Date(data)
            };
        }
        return this;
    }


    comMaterialComplementar(temMaterial = true) {
        let temMaterialBool = temMaterial;
        if (typeof temMaterial === 'string') {
            if (temMaterial.toLowerCase() === 'false' || temMaterial === '0') {
                temMaterialBool = false;
            } else if (temMaterial.toLowerCase() === 'true' || temMaterial === '1') {
                temMaterialBool = true;
            } else {
                temMaterialBool = undefined;
            }
        }
        if (temMaterialBool === true) {
            this.filtros.materialComplementar = {
                $exists: true,
                $not: {
                    $size: 0
                }
            };
        } else if (temMaterialBool === false) {
            this._addOrCondition([{
                    materialComplementar: {
                        $exists: false
                    }
                },
                {
                    materialComplementar: {
                        $size: 0
                    }
                }
            ]);
        }

        return this;
    }

    comThumbnail(temThumbnail = true) {
        if (temThumbnail) {
            this.filtros.thumbnail = {
                $exists: true,
                $ne: ''
            };
        } else {

            this._addOrCondition([{
                    thumbnail: {
                        $exists: false
                    }
                },
                {
                    thumbnail: ''
                }
            ]);
        }
        return this;
    }


    comCargaHorariaFaixa(faixa) {
        const faixas = {
            'curta': {
                min: 0,
                max: 20
            },
            'media': {
                min: 21,
                max: 50
            },
            'longa': {
                min: 51,
                max: null
            }
        };

        const faixaSelecionada = faixas[faixa?.toLowerCase()];
        if (faixaSelecionada) {
            this.filtros.cargaHorariaTotal = {
                $gte: faixaSelecionada.min
            };
            if (faixaSelecionada.max !== null) {
                this.filtros.cargaHorariaTotal.$lte = faixaSelecionada.max;
            }
        }
        return this;
    }

    escapeRegex(texto) {
        return texto.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }


    comStatus(status) {
        const statusValidos = ['ativo', 'inativo', 'rascunho', 'arquivado'];
        if (status && statusValidos.includes(status.toLowerCase())) {
            this.filtros.status = status.toLowerCase();
        }
        return this;
    }


    apenasAtivos() {


        this._addOrCondition([{
                status: 'ativo'
            },
            {
                status: {
                    $exists: false
                }
            },
            {
                status: null
            }
        ]);
        return this;
    }


    comQuantidadeAulas(min, max) {
        const minValid = min && !isNaN(parseInt(min));
        const maxValid = max && !isNaN(parseInt(max));

        if (minValid || maxValid) {


            this.filtros._quantidadeAulas = {};

            if (minValid) {
                this.filtros._quantidadeAulas.min = parseInt(min);
            }

            if (maxValid) {
                this.filtros._quantidadeAulas.max = parseInt(max);
            }
        }
        return this;
    }


    ordenarPor(campo, direcao = 'asc') {
        const camposValidos = [
            'titulo',
            'createdAt',
            'updatedAt',
            'cargaHorariaTotal',
            'status'
        ];

        if (campo && camposValidos.includes(campo)) {
            const direcaoValida = direcao.toLowerCase() === 'desc' ? -1 : 1;
            this.filtros._sort = {
                [campo]: direcaoValida
            };
        }
        return this;
    }


    reset() {
        this.filtros = {};
        this.orConditions = [];
        return this;
    }


    temFiltros() {
        return Object.keys(this.filtros).length > 0;
    }


    comCargaHorariaMin(min) {
        if (min !== undefined && !isNaN(parseInt(min)) && parseInt(min) >= 0) {
            this.filtros.cargaHorariaTotal = this.filtros.cargaHorariaTotal || {};
            this.filtros.cargaHorariaTotal.$gte = parseInt(min);
        }
        return this;
    }
    comCargaHorariaMax(max) {
        if (max !== undefined && !isNaN(parseInt(max)) && parseInt(max) >= 0) {
            this.filtros.cargaHorariaTotal = this.filtros.cargaHorariaTotal || {};
            this.filtros.cargaHorariaTotal.$lte = parseInt(max);
        }
        return this;
    }

    criadoPor(usuarioId) {
        return this.comCriadoPor(usuarioId);
    }

    comDataInicio(data) {
        return this.criadoApos(data);
    }
    comDataFim(data) {
        return this.criadoAntes(data);
    }

    aplicarFiltroPadrao() {
        this.filtros.status = 'ativo';
        return this;
    }


    build(debug = false, forceNewStructure = false) {
        if (debug) {
            console.log('Filtros aplicados:', JSON.stringify(this.filtros, null, 2));
        }


        const filtrosEspeciais = {};
        const filtrosNormais = {
            ...this.filtros
        };


        if (this.orConditions.length > 0) {
            if (this.orConditions.length === 1) {

                filtrosNormais.$or = this.orConditions[0];
            } else {

                filtrosNormais.$and = [
                    ...filtrosNormais.$and || [],
                    ...this.orConditions.map(cond => ({
                        $or: cond
                    }))
                ];
            }
        }


        if (filtrosNormais._quantidadeAulas) {
            filtrosEspeciais.quantidadeAulas = filtrosNormais._quantidadeAulas;
            delete filtrosNormais._quantidadeAulas;
        }

        if (filtrosNormais._sort) {
            filtrosEspeciais.sort = filtrosNormais._sort;
            delete filtrosNormais._sort;
        }


        const temFiltrosEspeciais = Object.keys(filtrosEspeciais).length > 0;

        if (!temFiltrosEspeciais && !forceNewStructure) {
            return filtrosNormais;
        }

        return {
            filtros: filtrosNormais,
            especiais: filtrosEspeciais
        };
    }
}

export default CursoFilterBuilder;