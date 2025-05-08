import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// Usuario Class

class Questionario {
    constructor() {
        const questionarioSchema = new mongoose.Schema({
            enunciado: {
                type: String,
                required: true
            },
            numeroRespostaCorreta: {
                type: Number,
                required: true,
                min: 0
            },
            alternativas: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Alternativa"
            }],
            aulaId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Aula",
                required: true
            }
        }, {
            versionKey: false
        });

        questionarioSchema.plugin(mongoosePaginate);
        this.model = mongoose.model("questionarios", questionarioSchema);
    }
}

export default new Questionario().model;