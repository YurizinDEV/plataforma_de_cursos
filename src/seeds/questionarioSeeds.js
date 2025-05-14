import fakerbr from "faker-br";
import Questionario from "../models/Questionario.js";
import Aula from "../models/Aula.js";
// import DbConnect from "../config/DbConnect.js";

export default async function questionariosSeed() {
    // await DbConnect.conectar();

    const aulas = await Aula.find({});
    await Questionario.deleteMany({});

    if (aulas.length === 0) {
        console.error("Erro: Nenhuma aula encontrada no banco.");
        return;
    }

    const questionarios = [];

    for (let i = 0; i < 20; i++) {
        const aula = aulas[Math.floor(Math.random() * aulas.length)];
        const alternativasTexto = fakerbr.random.arrayElements(
            ["Verdadeiro", "Falso", "Talvez", "Nenhuma"], 4
        );

        questionarios.push({
            enunciado: fakerbr.lorem.sentence(),
            numeroRespostaCorreta: fakerbr.random.number({
                min: 0,
                max: 3
            }),
            alternativas: [],
            aulaId: aula._id
        });
    }

    await Questionario.insertMany(questionarios);
    console.log("Questionários gerados com sucesso!");
}

// questionariosSeed();