import fakerbr from "faker-br";
import Curso from "../models/Curso.js";
import Usuario from "../models/Usuario.js";
// import DbConnect from "../config/DbConnect.js";

// DbConnect.conectar();

export default async function cursosSeed() {
    const usuarios = await Usuario.find({});
    await Curso.deleteMany({});

    const cursos = [];

    for (let i = 0; i < 30; i++) {
        const criador = usuarios[Math.floor(Math.random() * usuarios.length)];

        cursos.push({
            titulo: fakerbr.lorem.words(3),
            descricao: fakerbr.lorem.paragraph(),
            thumbnail: fakerbr.image.imageUrl(640, 480, "education", true),
            cargaHorariaTotal: fakerbr.random.number({
                min: 5,
                max: 40
            }),
            materialComplementar: [],
            professores: [fakerbr.name.findName()],
            tags: fakerbr.random.arrayElements(["js", "node", "db", "devops", "ux"], 3),
            criadoPorId: criador._id
        });
    }

    const inserted = await Curso.insertMany(cursos);

    for (const curso of inserted) {
        const aluno = usuarios[Math.floor(Math.random() * usuarios.length)];
        aluno.cursosIds.push(curso._id);
        aluno.progresso.push({
            percentual_conclusao: fakerbr.random.number({
                min: 0,
                max: 100
            }) + "%",
            curso: curso._id
        });
        await aluno.save();
    }

    console.log("Cursos gerados com sucesso");
}

cursosSeed();