// src/repositories/filters/CursoFilterBuilder.js

import CursoModel from '../../models/Curso.js';

class CursoFilterBuilder {
    constructor() {
        this.filtros = {};
        this.orConditions = []; // Para gerenciar múltiplas condições $or
        this.cursoModel = CursoModel;
    }

    // Método helper para adicionar condições $or
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
        // Verifica se tags existe e se tem elementos (não é um array vazio)
        if (tags && (Array.isArray(tags) ? tags.length > 0 : true)) {
            const tagsArray = Array.isArray(tags) ? tags : [tags];
            // Filtra para remover strings vazias
            const filteredTags = tagsArray.filter(tag => tag && tag.trim() !== '');
            if (filteredTags.length > 0) {
                // NOVA FUNCIONALIDADE: Suporte a múltiplas sintaxes para AND
                const firstTag = filteredTags[0];
                if (typeof firstTag === 'string') {
                    // Detecta separadores para operação AND
                    // Suporta: +, &, |AND|, %2B (encoded +), %26 (encoded &)
                    let andTags = null;
                    
                    if (firstTag.includes('+') || firstTag.includes('%2B')) {
                        // Sintaxe: tags=js+db ou tags=js%2Bdb
                        andTags = firstTag.replace(/%2B/gi, '+').split('+');
                    } else if (firstTag.includes('&') || firstTag.includes('%26')) {
                        // Sintaxe: tags=js&db ou tags=js%26db  
                        andTags = firstTag.replace(/%26/gi, '&').split('&');
                    } else if (firstTag.includes('|AND|')) {
                        // Sintaxe mais explícita: tags=js|AND|db
                        andTags = firstTag.split('|AND|');
                    }
                    
                    if (andTags && andTags.length > 1) {
                        // Operação AND: todas as tags devem estar presentes
                        const cleanTags = andTags.map(tag => tag.trim()).filter(tag => tag !== '');
                        this.filtros.tags = {
                            $all: cleanTags
                        };
                    } else {
                        // Comportamento padrão: OR (qualquer uma das tags)
                        this.filtros.tags = {
                            $in: filteredTags
                        };
                    }
                } else {
                    // Comportamento padrão: OR (qualquer uma das tags)
                    this.filtros.tags = {
                        $in: filteredTags
                    };
                }
            }
        }
        return this;
    }

    // Novo: Cursos que contenham TODAS as tags mencionadas (AND)
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

    // Alias para deixar mais claro o comportamento atual
    comQualquerTag(tags) {
        return this.comTags(tags);
    }

    comProfessores(professores) {
        // Verifica se professores existe e se tem elementos (não é um array vazio)
        if (professores && (Array.isArray(professores) ? professores.length > 0 : true)) {
            const professoresArray = Array.isArray(professores) ? professores : [professores];
            // Filtra para remover strings vazias
            const filteredProfessores = professoresArray.filter(prof => prof && prof.trim() !== '');
            if (filteredProfessores.length > 0) {
                // NOVA FUNCIONALIDADE: Suporte a múltiplas sintaxes para AND
                const firstProf = filteredProfessores[0];
                if (typeof firstProf === 'string') {
                    // Detecta separadores para operação AND
                    // Suporta: +, &, |AND|, %2B (encoded +), %26 (encoded &)
                    let andProfessores = null;
                    
                    if (firstProf.includes('+') || firstProf.includes('%2B')) {
                        // Sintaxe: professores=Prof1+Prof2 ou professores=Prof1%2BProf2
                        andProfessores = firstProf.replace(/%2B/gi, '+').split('+');
                    } else if (firstProf.includes('&') || firstProf.includes('%26')) {
                        // Sintaxe: professores=Prof1&Prof2 ou professores=Prof1%26Prof2  
                        andProfessores = firstProf.replace(/%26/gi, '&').split('&');
                    } else if (firstProf.includes('|AND|')) {
                        // Sintaxe mais explícita: professores=Prof1|AND|Prof2
                        andProfessores = firstProf.split('|AND|');
                    }
                    
                    if (andProfessores && andProfessores.length > 1) {
                        // Operação AND: todos os professores devem estar presentes
                        const cleanProfessores = andProfessores.map(prof => prof.trim()).filter(prof => prof !== '');
                        this.filtros.professores = {
                            $all: cleanProfessores
                        };
                    } else {
                        // Comportamento padrão: OR (qualquer um dos professores)
                        this.filtros.professores = {
                            $in: filteredProfessores
                        };
                    }
                } else {
                    // Comportamento padrão: OR (qualquer um dos professores)
                    this.filtros.professores = {
                        $in: filteredProfessores
                    };
                }
            }
        }
        return this;
    }

    // Novo: Cursos que tenham TODOS os professores mencionados (AND)
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

    // Alias para deixar mais claro o comportamento atual
    comQualquerProfessor(professores) {
        return this.comProfessores(professores);
    }
    comCargaHoraria(min, max) {
        // Verifica se pelo menos um dos valores é válido
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

    comCriadoPor(usuarioId) {
        if (usuarioId && usuarioId.trim() !== '') {
            this.filtros.criadoPorId = usuarioId;
        }
        return this;
    }

    // Novo: Busca exata por título (sem regex)
    comTituloExato(titulo) {
        if (titulo && titulo.trim() !== '') {
            this.filtros.titulo = titulo.trim();
        }
        return this;
    }

    // Novo: Busca na descrição
    comDescricao(descricao) {
        if (descricao && descricao.trim() !== '') {
            this.filtros.descricao = {
                $regex: descricao,
                $options: 'i'
            };
        }
        return this;
    }

    // Novo: Busca geral em título, descrição e tags
    comBuscaGeral(termo) {
        if (termo && termo.trim() !== '') {
            const regex = { $regex: termo, $options: 'i' };
            this.filtros.$or = [
                { titulo: regex },
                { descricao: regex },
                { tags: { $in: [new RegExp(termo, 'i')] } }
            ];
        }
        return this;
    }

    // Novo: Filtros de data
    criadoApos(data) {
        if (data) {
            this.filtros.createdAt = { ...this.filtros.createdAt, $gte: new Date(data) };
        }
        return this;
    }

    criadoAntes(data) {
        if (data) {
            this.filtros.createdAt = { ...this.filtros.createdAt, $lte: new Date(data) };
        }
        return this;
    }

    atualizadoApos(data) {
        if (data) {
            this.filtros.updatedAt = { ...this.filtros.updatedAt, $gte: new Date(data) };
        }
        return this;
    }

    // Novo: Filtros de conteúdo
    comMaterialComplementar(temMaterial = true) {
        if (temMaterial) {
            this.filtros.materialComplementar = { $exists: true, $not: { $size: 0 } };
        } else {
            // Adicionar condição $or para sem material
            this._addOrCondition([
                { materialComplementar: { $exists: false } },
                { materialComplementar: { $size: 0 } }
            ]);
        }
        return this;
    }

    comThumbnail(temThumbnail = true) {
        if (temThumbnail) {
            this.filtros.thumbnail = { $exists: true, $ne: '' };
        } else {
            // Adicionar condição $or para sem thumbnail
            this._addOrCondition([
                { thumbnail: { $exists: false } },
                { thumbnail: '' }
            ]);
        }
        return this;
    }

    // Novo: Filtro inteligente por faixa de carga horária
    comCargaHorariaFaixa(faixa) {
        const faixas = {
            'curta': { min: 0, max: 20 },
            'media': { min: 21, max: 50 },
            'longa': { min: 51, max: null }
        };

        const faixaSelecionada = faixas[faixa?.toLowerCase()];
        if (faixaSelecionada) {
            this.filtros.cargaHorariaTotal = { $gte: faixaSelecionada.min };
            if (faixaSelecionada.max !== null) {
                this.filtros.cargaHorariaTotal.$lte = faixaSelecionada.max;
            }
        }
        return this;
    }

    escapeRegex(texto) {
        return texto.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }

    // Novo: Filtro por status do curso
    comStatus(status) {
        const statusValidos = ['ativo', 'inativo', 'rascunho', 'arquivado'];
        if (status && statusValidos.includes(status.toLowerCase())) {
            this.filtros.status = status.toLowerCase();
        }
        return this;
    }

    // Novo: Filtro para compatibilidade com cursos sem campo status
    apenasAtivos() {
        // Filtro compatível com dados antigos: inclui cursos 'ativo' e cursos sem status (null/undefined)
        // Usar _addOrCondition para preservar outros filtros $or
        this._addOrCondition([
            { status: 'ativo' },
            { status: { $exists: false } },
            { status: null }
        ]);
        return this;
    }

    // Novo: Filtro por quantidade de aulas
    comQuantidadeAulas(min, max) {
        const minValid = min && !isNaN(parseInt(min));
        const maxValid = max && !isNaN(parseInt(max));

        if (minValid || maxValid) {
            // Este filtro precisará ser aplicado via aggregation pipeline
            // Por agora, vamos marcar para processamento posterior
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

    // Novo: Sistema de ordenação inteligente
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
            this.filtros._sort = { [campo]: direcaoValida };
        }
        return this;
    }

    // Novo: Método para resetar filtros
    reset() {
        this.filtros = {};
        return this;
    }

    // Novo: Método para verificar se há filtros aplicados
    temFiltros() {
        return Object.keys(this.filtros).length > 0;
    }

    // Melhorado: Build com opção de debug e compatibilidade
    build(debug = false, forceNewStructure = false) {
        if (debug) {
            console.log('Filtros aplicados:', JSON.stringify(this.filtros, null, 2));
        }
        
        // Separar filtros especiais que precisam de tratamento diferente
        const filtrosEspeciais = {};
        const filtrosNormais = { ...this.filtros };
        
        // Adicionar condições $or se houver
        if (this.orConditions.length > 0) {
            if (this.orConditions.length === 1) {
                // Se só há uma condição $or, usar diretamente
                filtrosNormais.$or = this.orConditions[0];
            } else {
                // Se há múltiplas condições $or, combinar com $and
                filtrosNormais.$and = [
                    ...filtrosNormais.$and || [],
                    ...this.orConditions.map(cond => ({ $or: cond }))
                ];
            }
        }
        
        // Extrair filtros especiais
        if (filtrosNormais._quantidadeAulas) {
            filtrosEspeciais.quantidadeAulas = filtrosNormais._quantidadeAulas;
            delete filtrosNormais._quantidadeAulas;
        }
        
        if (filtrosNormais._sort) {
            filtrosEspeciais.sort = filtrosNormais._sort;
            delete filtrosNormais._sort;
        }
        
        // Se não há filtros especiais e não é forçado a nova estrutura, usar formato antigo para compatibilidade
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