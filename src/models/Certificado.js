import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// Certificados Class  

class Certificado {
    constructor() {
        const certificadoSchema = new mongoose.Schema({
            dataEmissao: {
                type: Date,
                default: Date.now
            },
            usuarioId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Usuario",
                required: true
            },
            cursoId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Curso",
                required: true
            }
        }, {
            versionKey: false
        });

        certificadoSchema.plugin(mongoosePaginate);
        this.model = mongoose.model("certificados", certificadoSchema);
    }
}

export default new Certificado().model;