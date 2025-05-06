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
        this.model = mongoose.model("Certificado", certificadoSchema);
    }
}

/*
class Certificado {
    constructor() {
        const certificadoSchema = new mongoose.Schema({
            cert_id: {
                type: Number,
                index: true,
                required: true
            },
            cert_data_emissao: {
                type: Date,
                default: Date.now
            },
            cert_curs_id_curso_fk: {
                type: Number,
                required: true
            },
            cert_usua_id_usuario_fk: {
                type: Number,
                required: true
            }
        });
    }
}*/