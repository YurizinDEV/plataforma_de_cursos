import fakerbr from "faker-br";
import {
    UsuarioModel
} from "../models/Usuario.js";

const senhaPura = "123456";

function gerarSenha() {
    return bcrypt.hashSync(senhaPura, 12); 
}

export default async function usuariosSeed() {
    await UsuarioModel.deleteMany({});

    const usuarios = [];

    for (let i = 0; i < 20; i++) {
        const isAdmin = i < 2; 
        usuarios.push({
            nome: fakerbr.name.firstName() + " " + fakerbr.name.lastName(),
            senha: gerarSenha(), 
            email: fakerbr.internet.email().toLowerCase(),
            ehAdmin: isAdmin,
            progresso: [],
            cursosIds: []
        });
    }

    await UsuarioModel.insertMany(usuarios);
    console.log("Usuários gerados com sucesso");
}

usuariosSeed();