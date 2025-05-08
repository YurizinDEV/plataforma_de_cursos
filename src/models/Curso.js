import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// Curso Class  

class Curso {
    constructor() {
        const cursoSchema = new mongoose.Schema({
            titulo: {
                type: String,
                required: true,
                maxlength: 100
            },
            descricao: {
                type: String
            },
            criadoEm: {
                type: Date,
                default: Date.now
            },
            thumbnail: {
                type: String,
                maxlength: 250
            },
            cargaHorariaTotal: {
                type: Number,
                required: true,
                min: 1
            },
            materialComplementar: {
                type: [String]
            },
            professores: {
                type: [String]
            },
            tags: {
                type: [String]
            },
            criadoPorId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Usuario",
                required: true
            }
        }, {
            versionKey: false
        });

        cursoSchema.plugin(mongoosePaginate);
        this.model = mongoose.model("cursos", cursoSchema);
    }
}

export default new Curso().model;