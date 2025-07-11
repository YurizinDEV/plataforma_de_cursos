import fakerbr from "faker-br";
import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";
// import DbConnect from "../config/DbConnect.js";

// DbConnect.conectar();

const senhaPura = "1234Teste@";

function gerarSenha() {
    return bcrypt.hashSync(senhaPura, 12);
}

export default async function usuariosSeed() {
    await Usuario.deleteMany({});

    const usuarios = [];

    usuarios.push({
        nome: "Administrador",
        senha: bcrypt.hashSync("Admin@1234", 12),
        email: "admin@gmail.com",
        ativo: true,
        progresso: [],
        cursosIds: [],
        grupos: []
    });

    for (let i = 0; i < 19; i++) {
        const isAtivo = i < 14;
        usuarios.push({
            nome: fakerbr.name.firstName() + " " + fakerbr.name.lastName(),
            senha: gerarSenha(),
            email: fakerbr.internet.email(),
            ativo: isAtivo,
            progresso: [],
            cursosIds: [],
            grupos: []
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
            console.log(`Admin criado: admin@example.com / admin123`);
            console.log(`ID do admin: ${adminId}`);
        }
    } catch (error) {
        console.log("Aviso: Não foi possível associar usuários ao grupo admin (execute as seeds de grupos primeiro)");
        console.error(error);
    }
}

// usuariosSeed();