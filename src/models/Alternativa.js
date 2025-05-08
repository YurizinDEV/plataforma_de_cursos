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
        this.model = mongoose.model("alternativas", alternativaSchema);
    }
}

export default new Alternativa().model;