import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// Usuario Class

class Alternativa {
    constructor() {
        const alternativaSchema = new mongoose.Schema({
            texto: {
                type: String,
                required: true
            },
            numeroResposta: {
                type: Number,
                required: true,
                min: 0
            },
            questionarioId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Questionario",
                required: true
            }
        }, {
            versionKey: false
        });

        alternativaSchema.plugin(mongoosePaginate);
        this.model = mongoose.model("Alternativa", alternativaSchema);
    }
}

/*class Alternativa {  
    constructor() {  
        const alternativaSchema = new mongoose.Schema({  
            ale_id: { type: Number, index: true, required: true },  
            ale_texto: { type: String, required: true, maxlength: 250 },  
            ale_numero: { type: Number, required: true },  
            ale_ques_id_quest_fk: { type: Number, required: true }  
        });  
    }  
}  */

    /*class Alternativa {  
    constructor() {  
        const alternativaSchema = new mongoose.Schema({  
            ale_id: { type: Number, index: true, required: true },  
            ale_texto: { type: String, required: true, maxlength: 250 },  
            ale_numero: { type: Number, required: true },  
            ale_ques_id_quest_fk: { type: Number, required: true }  
        });  
    }  
}  */