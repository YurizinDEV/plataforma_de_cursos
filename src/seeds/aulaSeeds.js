import fakerbr from "faker-br";
import Aula from "../models/Aula.js";
import Curso from "../models/Curso.js";
import Usuario from "../models/Usuario.js";
// import DbConnect from "../config/DbConnect.js";

export default async function aulasSeed() {
    // await DbConnect.conectar();

    const cursos = await Curso.find({});
    const usuarios = await Usuario.find({});
    await Aula.deleteMany({});

    if (cursos.length === 0 || usuarios.length === 0) {
        throw new Error("Cursos ou usuários estão vazios. Verifique os seeds.");
    }

    const aulas = [];

    for (let i = 0; i < 100; i++) {
        const curso = cursos[Math.floor(Math.random() * cursos.length)];
        const autor = usuarios[Math.floor(Math.random() * usuarios.length)];

        aulas.push({
            titulo: fakerbr.lorem.words(4),
            descricao: fakerbr.lorem.paragraph(),
            conteudoURL: fakerbr.internet.url(),
            cargaHoraria: fakerbr.random.number({
                min: 1,
                max: 3
            }),
            materialComplementar: [],
            cursoId: curso._id,
            criadoPorId: autor._id
        });
    }

    await Aula.insertMany(aulas);
    console.log("Aulas geradas com sucesso!");
    // console.log(aulas)
}

// aulasSeed();