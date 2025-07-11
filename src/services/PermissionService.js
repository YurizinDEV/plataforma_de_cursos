import Usuario from "../models/Usuario.js";
import Grupo from "../models/Grupo.js";
import Rota from '../models/Rota.js';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import { CustomError } from '../utils/helpers/index.js';

class PermissionService {
    constructor() {
        this.repository = new UsuarioRepository();
        this.Usuario = Usuario;
        this.Grupo = Grupo;
        this.Rota = Rota;
    }

    async hasPermission(userId, rota, dominio, metodo) {
        try {
            const usuario = await this.repository.buscarPorId(userId, { grupos: true });
            if (!usuario) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Usuário',
                    details: [],
                    customMessage: 'Usuário não encontrado'
                });
            }

            // ✅ Verificar se é administrador através do grupo
            const isAdmin = usuario.grupos && Array.isArray(usuario.grupos) && 
                           usuario.grupos.some(grupo => grupo.nome === 'Administradores');
            
            if (isAdmin) {
                console.log(`🔐 Usuário ${userId} é administrador, permitindo acesso total`);
                return true;
            }

            let permissoes = usuario.permissoes || [];

            // Verifica se usuario.grupos é um array antes de iterar
            if (Array.isArray(usuario.grupos)) {
                for (const grupo of usuario.grupos) {
                    permissoes = permissoes.concat(grupo.permissoes || []);
                }
            }

            const permissoesUnicas = [];
            const combinacoes = new Set();

            permissoes.forEach(permissao => {
                const chave = `${permissao.rota}_${permissao.dominio}`;
                if (!combinacoes.has(chave)) {
                    combinacoes.add(chave);
                    permissoesUnicas.push(permissao);
                }
            });

            const hasPermissao = permissoesUnicas.some(permissao => {
                return (
                    permissao.rota === rota &&
                    permissao.dominio === dominio &&
                    permissao.ativo &&
                    permissao[metodo] 
                );
            });

            return hasPermissao;
        } catch (error) {
            console.error("Erro ao verificar permissões:", error);
            return false;
        }
    }
}

export default PermissionService;
