import {
    fakeMappings
} from "./globalFakeMapping.js";
import Certificado from "../models/Certificado.js";
import Curso from "../models/Curso.js";
import Usuario from "../models/Usuario.js";

export default async function certificadosSeed() {
    const usuarios = await Usuario.find({});
    const cursos = await Curso.find({});
    await Certificado.deleteMany({});

    for (let i = 0; i < 50; i++) {
        const user = usuarios[Math.floor(Math.random() * usuarios.length)];
        const curso = cursos[Math.floor(Math.random() * cursos.length)];

        const certificado = {
            dataEmissao: fakeMappings.Certificado.dataEmissao.apply(),
            usuarioId: user._id,
            cursoId: curso._id
        };

        await Certificado.create(certificado);
    }

    console.log("Certificados gerados com sucesso");
}

// certificadosSeed();