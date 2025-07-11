import GrupoService from '../services/GrupoService.js';
import RotaService from '../services/RotaService.js';
import { CommonResponse, HttpStatusCodes } from '../utils/helpers/index.js';

class PermissionController {
    constructor() {
        this.grupoService = new GrupoService();
        this.rotaService = new RotaService();
    }

    // Adicionar permissão a um grupo
    async adicionarPermissaoGrupo(req, res) {
        const { grupoId } = req.params;
        const { rota, dominio, ativo, buscar, enviar, substituir, modificar, excluir } = req.body;
        
        const grupo = await this.grupoService.repository.buscarPorId(grupoId);
        
        // Verifica se a permissão já existe
        const permissaoExistente = grupo.permissoes.find(p => 
            p.rota === rota && p.dominio === dominio
        );
        
        if (permissaoExistente) {
            // Atualiza permissão existente
            permissaoExistente.ativo = ativo;
            permissaoExistente.buscar = buscar;
            permissaoExistente.enviar = enviar;
            permissaoExistente.substituir = substituir;
            permissaoExistente.modificar = modificar;
            permissaoExistente.excluir = excluir;
        } else {
            // Adiciona nova permissão
            grupo.permissoes.push({
                rota,
                dominio,
                ativo,
                buscar,
                enviar,
                substituir,
                modificar,
                excluir
            });
        }
        
        await grupo.save();
        
        const response = new CommonResponse({
            error: false,
            code: HttpStatusCodes.OK.code,
            message: 'Permissão atualizada com sucesso',
            data: grupo
        });
        
        res.status(response.code).json(response);
    }

    // Remover permissão de um grupo
    async removerPermissaoGrupo(req, res) {
        const { grupoId } = req.params;
        const { rota, dominio } = req.body;
        
        const grupo = await this.grupoService.repository.buscarPorId(grupoId);
        
        grupo.permissoes = grupo.permissoes.filter(p => 
            !(p.rota === rota && p.dominio === dominio)
        );
        
        await grupo.save();
        
        const response = new CommonResponse({
            error: false,
            code: HttpStatusCodes.OK.code,
            message: 'Permissão removida com sucesso',
            data: grupo
        });
        
        res.status(response.code).json(response);
    }

    // Listar todas as rotas disponíveis para configuração
    async listarRotasDisponiveis(req, res) {
        const rotas = await this.rotaService.repository.model.find({}).lean();
        
        const response = new CommonResponse({
            statusCode: HttpStatusCodes.OK.code,
            message: 'Rotas disponíveis',
            data: rotas
        });
        
        res.status(response.statusCode).json(response);
    }

    // Obter estrutura de permissões de um grupo
    async obterPermissoesGrupo(req, res) {
        const { grupoId } = req.params;
        const grupo = await this.grupoService.repository.buscarPorId(grupoId);
        
        const response = new CommonResponse({
            error: false,
            code: HttpStatusCodes.OK.code,
            message: 'Permissões do grupo',
            data: {
                grupo: {
                    id: grupo._id,
                    nome: grupo.nome,
                    descricao: grupo.descricao,
                    ativo: grupo.ativo
                },
                permissoes: grupo.permissoes
            }
        });
        
        res.status(response.code).json(response);
    }

    // Configurar múltiplas permissões de uma vez
    async configurarPermissoesGrupo(req, res) {
        const { grupoId } = req.params;
        const { permissoes } = req.body; // Array de permissões
        
        const grupo = await this.grupoService.repository.buscarPorId(grupoId);
        
        // Substitui todas as permissões
        grupo.permissoes = permissoes;
        await grupo.save();
        
        const response = new CommonResponse({
            statusCode: HttpStatusCodes.OK.code,
            message: 'Permissões configuradas com sucesso',
            data: grupo
        });
        
        res.status(response.statusCode).json(response);
    }

    // Método simplificado para configurar permissão (compatível com o body que você está enviando)
    async configurarPermissaoSimples(req, res) {
        const { grupoId, rotaId, permissoes } = req.body;
        
        const grupo = await this.grupoService.repository.buscarPorId(grupoId);
        
        // Verifica se a permissão já existe para esta rota
        const permissaoExistente = grupo.permissoes.find(p => p.rota === rotaId);
        
        if (permissaoExistente) {
            // Atualiza permissão existente
            permissaoExistente.ativo = true;
            permissaoExistente.buscar = permissoes.buscar || false;
            permissaoExistente.enviar = permissoes.enviar || false;
            permissaoExistente.substituir = permissoes.substituir || false;
            permissaoExistente.modificar = permissoes.modificar || false;
            permissaoExistente.excluir = permissoes.excluir || false;
        } else {
            // Adiciona nova permissão
            grupo.permissoes.push({
                rota: rotaId,
                dominio: 'localhost', // Valor padrão
                ativo: true,
                buscar: permissoes.buscar || false,
                enviar: permissoes.enviar || false,
                substituir: permissoes.substituir || false,
                modificar: permissoes.modificar || false,
                excluir: permissoes.excluir || false
            });
        }
        
        await grupo.save();
        
        const response = new CommonResponse({
            error: false,
            code: HttpStatusCodes.OK.code,
            message: 'Permissão configurada com sucesso',
            data: grupo
        });
        
        res.status(response.code).json(response);
    }
}

export default PermissionController;
