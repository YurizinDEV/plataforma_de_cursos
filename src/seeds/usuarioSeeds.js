import fakerbr from "faker-br";
import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";
// import DbConnect from "../config/DbConnect.js";

// DbConnect.conectar();

const senhaPura = "123456";

function gerarSenha() {
    return bcrypt.hashSync(senhaPura, 12);
}

export default async function usuariosSeed() {
    await Usuario.deleteMany({});

    const usuarios = [];

    for (let i = 0; i < 20; i++) {
        const isAdmin = i < 2;        usuarios.push({            nome: fakerbr.name.firstName() + " " + fakerbr.name.lastName(),
            senha: gerarSenha(),
            email: fakerbr.internet.email(),
            ehAdmin: isAdmin,
            ativo: false,
            progresso: [],
            cursosIds: []
        });
    }

    await Usuario.insertMany(usuarios);
    console.log("Usuários gerados com sucesso");
    // console.log(usuarios);
}

// usuariosSeed();