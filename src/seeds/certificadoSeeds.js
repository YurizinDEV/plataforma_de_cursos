import fakerbr from "faker-br";
import Certificado from "../models/Certificado.js";
import Curso from "../models/Curso.js";
import Usuario from "../models/Usuario.js";
// import DbConnect from "../config/DbConnect.js";

export default async function certificadosSeed() {
    // await DbConnect.conectar();

    const usuarios = await Usuario.find({});
    const cursos = await Curso.find({});
    await Certificado.deleteMany({});

    for (let i = 0; i < 50; i++) {
        const user = usuarios[Math.floor(Math.random() * usuarios.length)];
        const curso = cursos[Math.floor(Math.random() * cursos.length)];

        const certificado = {
            dataEmissao: fakerbr.date.past(),
            usuarioId: user._id,
            cursoId: curso._id
        };

        await Certificado.create(certificado);
    }

    console.log("Certificados gerados com sucesso");
}

certificadosSeed();