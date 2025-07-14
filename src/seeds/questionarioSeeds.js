import {
    fakeMappings
} from "./globalFakeMapping.js";
import Questionario from "../models/Questionario.js";
import Aula from "../models/Aula.js";

export default async function questionariosSeed() {
    const aulas = await Aula.find({});
    await Questionario.deleteMany({});

    if (aulas.length === 0) {
        console.error("Erro: Nenhuma aula encontrada no banco.");
        return;
    }

    const questionarios = [];

    for (let i = 0; i < 20; i++) {
        const aula = aulas[Math.floor(Math.random() * aulas.length)];

        questionarios.push({
            enunciado: fakeMappings.Questionario.enunciado.apply(),
            numeroRespostaCorreta: fakeMappings.Questionario.numeroRespostaCorreta.apply(),
            alternativas: fakeMappings.Questionario.alternativas.apply(),
            aulaId: aula._id
        });
    }

    await Questionario.insertMany(questionarios);
    console.log("Questionários gerados com sucesso!");
}

// questionariosSeed();