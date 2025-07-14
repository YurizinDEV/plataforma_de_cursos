import {
    fakeMappings
} from "./globalFakeMapping.js";
import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";

export default async function usuariosSeed() {
    await Usuario.deleteMany({});

    const usuarios = [];

    // Usuário administrador fixo
    usuarios.push({
        nome: "Administrador",
        senha: await bcrypt.hash("Admin@1234", 12),
        email: "admin@gmail.com",
        ativo: true,
        progresso: [],
        cursosIds: [],
        grupos: []
    });

    for (let i = 0; i < 19; i++) {
        const isAtivo = i < 14;
        usuarios.push({
            nome: fakeMappings.Usuario.nome.apply(),
            senha: fakeMappings.Usuario.senha.apply(),
            email: fakeMappings.Usuario.email.apply(),
            ativo: isAtivo,
            progresso: fakeMappings.Usuario.progresso.apply(),
            cursosIds: fakeMappings.Usuario.cursosIds.apply(),
            grupos: fakeMappings.Usuario.grupos.apply()
        });
    }

    const usuariosCriados = await Usuario.insertMany(usuarios);
    console.log("Usuários gerados com sucesso");

    try {
        const Grupo = (await import('../models/Grupo.js')).default;
        const grupoAdmin = await Grupo.findOne({
            nome: 'Administradores'
        });

        if (grupoAdmin) {
            const adminId = usuariosCriados[0]._id;
            await Usuario.updateOne({
                _id: adminId
            }, {
                $push: {
                    grupos: grupoAdmin._id
                }
            });
            console.log("Usuário administrador fixo associado ao grupo");
            console.log(`Admin criado: admin@gmail.com / Admin@1234`);
            console.log(`ID do admin: ${adminId}`);
        }
    } catch (error) {
        console.log("Aviso: Não foi possível associar usuários ao grupo admin (execute as seeds de grupos primeiro)");
        console.error(error);
    }
}

// usuariosSeed();