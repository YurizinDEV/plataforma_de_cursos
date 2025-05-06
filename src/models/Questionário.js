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
        this.model = mongoose.model("Questionario", questionarioSchema);
    }
}


/*class Questionario {  
    constructor() {  
        const questionarioSchema = new mongoose.Schema({  
            ques_id_quest_pk: { type: Number, index: true, required: true },  
            ques_enunciado: { type: String, required: true },  
            ques_resposta_correta: { type: Number, required: true },  
            ques_numero: { type: Number, required: true },  
            ques_id_curso_fk: { type: Number, required: true }  
        });  
    }  
}  
*/