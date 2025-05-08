import fakerbr from "faker-br";
import {
    AlternativaModel,
    QuestionarioModel
} from "../models/Alternativa.js";

export default async function alternativasSeed() {
    const questionarios = await QuestionarioModel.find({});
    await AlternativaModel.deleteMany({});

    const alternativasTotal = [];

    for (const q of questionarios) {
        const alternativas = [];

        for (let i = 0; i < 4; i++) {
            const alt = {
                texto: fakerbr.lorem.words(3),
                numeroResposta: i,
                questionarioId: q._id
            };
            alternativas.push(alt);
            alternativasTotal.push(alt);
        }

    }

    const inseridas = await AlternativaModel.insertMany(alternativasTotal);

    for (const alt of inseridas) {
        await QuestionarioModel.updateOne({
            _id: alt.questionarioId
        }, {
            $push: {
                alternativas: alt._id
            }
        });
    }

    console.log("Alternativas geradas com sucesso");
    console.log("Alternativas inseridas:", inseridas);
}

alternativasSeed();