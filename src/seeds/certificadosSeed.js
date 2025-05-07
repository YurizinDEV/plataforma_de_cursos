import fakerbr from "faker-br";
import {
    CertificadoModel,
    UsuarioModel,
    CursoModel
} from "../models/Certificado.js";

export default async function certificadosSeed() {
    const usuarios = await UsuarioModel.find({});
    const cursos = await CursoModel.find({});
    await CertificadoModel.deleteMany({});

    for (let i = 0; i < 50; i++) {
        const user = usuarios[Math.floor(Math.random() * usuarios.length)];
        const curso = cursos[Math.floor(Math.random() * cursos.length)];

        const certificado = {
            dataEmissao: fakerbr.date.past(),
            usuarioId: user._id,
            cursoId: curso._id
        };

        await CertificadoModel.create(certificado);
    }

    console.log("Certificados gerados com sucesso");
}

certificadosSeed();