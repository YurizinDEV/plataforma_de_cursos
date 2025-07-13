import {
    fakeMappings
} from "./globalFakeMapping.js";
import Aula from "../models/Aula.js";
import Curso from "../models/Curso.js";
import Usuario from "../models/Usuario.js";

export default async function aulasSeed() {
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
            titulo: fakeMappings.common.titulo.apply(),
            descricao: fakeMappings.common.descricao.apply(),
            conteudoURL: fakeMappings.Aula.conteudoURL.apply(),
            cargaHoraria: fakeMappings.Aula.cargaHoraria.apply(),
            materialComplementar: fakeMappings.common.materialComplementar.apply(),
            cursoId: curso._id,
            criadoPorId: autor._id
        });
    }

    await Aula.insertMany(aulas);
    console.log("Aulas geradas com sucesso!");
}

// aulasSeed();