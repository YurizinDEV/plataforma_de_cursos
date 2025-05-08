import fakerbr from "faker-br";
import {
    AulaModel,
    CursoModel,
    UsuarioModel
} from "../models/Aula.js";

export default async function aulasSeed() {
    const cursos = await CursoModel.find({});
    const usuarios = await UsuarioModel.find({});
    await AulaModel.deleteMany({});

    const aulas = [];

    for (let i = 0; i < 100; i++) {
        const curso = cursos[Math.floor(Math.random() * cursos.length)];
        const autor = usuarios[Math.floor(Math.random() * usuarios.length)];

        aulas.push({
            titulo: fakerbr.lorem.words(4),
            descricao: fakerbr.lorem.paragraph(),
            conteudoURL: fakerbr.internet.url(),
            cargaHoraria: fakerbr.datatype.number({
                min: 1,
                max: 3
            }),
            materialComplementar: [],
            cursoId: curso._id,
            criadoPorId: autor._id
        });
    }

    await AulaModel.insertMany(aulas);
    console.log("Aulas geradas com sucesso");
}

aulasSeed();