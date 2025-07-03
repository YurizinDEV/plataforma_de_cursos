import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// Curso Class  

class Curso {
    constructor() {
        const cursoSchema = new mongoose.Schema({
            titulo: {
                type: String,
                required: true,
                maxlength: 100,
                unique: true
            },
            descricao: {
                type: String
            },
            thumbnail: {
                type: String,
                maxlength: 250
            },
            cargaHorariaTotal: {
                type: Number,
                default: 0,
                min: 0
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
            status: {
                type: String,
                enum: ['ativo', 'inativo', 'rascunho', 'arquivado'],
                default: 'ativo'
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

        cursoSchema.plugin(mongoosePaginate);
        this.model = mongoose.model("Curso", cursoSchema);
    }
}

export default new Curso().model;