import {
    fakeMappings
} from "./globalFakeMapping.js";
import Alternativa from "../models/Alternativa.js";
import Questionario from "../models/Questionario.js";

export default async function alternativasSeed() {
    const questionarios = await Questionario.find({});
    await Alternativa.deleteMany({});

    const alternativasTotal = [];

    for (const q of questionarios) {
        for (let i = 0; i < 4; i++) {
            const alt = {
                texto: fakeMappings.Alternativa.texto.apply(),
                numeroResposta: i,
                questionarioId: q._id
            };
            alternativasTotal.push(alt);
        }
    }

    const inseridas = await Alternativa.insertMany(alternativasTotal);

    for (const alt of inseridas) {
        await Questionario.updateOne({
            _id: alt.questionarioId
        }, {
            $push: {
                alternativas: alt._id
            }
        });
    }

    console.log("Alternativas geradas com sucesso!");
    console.log("Total inseridas:", inseridas.length);
}

// alternativasSeed();