import fakerbr from "faker-br";
import {
    QuestionarioModel,
    AulaModel
} from "../models/Questionário.js";

export default async function questionariosSeed() {
    const aulas = await AulaModel.find({});
    await QuestionarioModel.deleteMany({});

    const questionarios = [];

    for (let i = 0; i < 200; i++) {
        const aula = aulas[Math.floor(Math.random() * aulas.length)];
        const alternativasTexto = fakerbr.random.arrayElements(
            ["Verdadeiro", "Falso", "Talvez", "Nenhuma"], 4
        );

        questionarios.push({
            enunciado: fakerbr.lorem.sentence(),
            numeroRespostaCorreta: fakerbr.datatype.number({
                min: 0,
                max: 3
            }),
            alternativas: [], // será preenchido por alternativasSeed
            aulaId: aula._id
        });
    }

    await QuestionarioModel.insertMany(questionarios);
    console.log("Questionários gerados com sucesso");
}

questionariosSeed();