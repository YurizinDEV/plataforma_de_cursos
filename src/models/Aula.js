import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// Aula Class

class Aula {
    constructor() {
        const aulaSchema = new mongoose.Schema({
            titulo: {
                type: String,
                required: true,
                maxlength: 100
            },
            descricao: {
                type: String
            },
            conteudoURL: {
                type: String,
                required: true
            },
            cargaHoraria: {
                type: Number,
                required: true,
                min: 1
            },
            materialComplementar: {
                type: [String]
            },
            cursoId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Curso",
                required: true
            },
            criadoPorId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Usuario",
                required: true
            }
        }, {
            versionKey: false,
            timestamps: true
        });

        aulaSchema.plugin(mongoosePaginate);
        this.model = mongoose.model("Aula", aulaSchema);
    }
}

export default new Aula().model;