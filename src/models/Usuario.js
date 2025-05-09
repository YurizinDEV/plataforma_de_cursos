import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// Usuario Class

class Usuario {
    constructor() {
        
        const usuarioSchema = new mongoose.Schema({

            nome: {
                type: String,
                required: true,
                maxlength: 100
            },
            senha: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true,
                unique: true,
                lowercase: true
            },
            ehAdmin: {
                type: Boolean,
                default: false
            },
            progresso: [{

                percentual_conclusao: {
                    type: String,
                    required: true
                },
                curso: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Curso",
                    required: true
                }
            }],

            cursosIds: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Curso"
            }]
        }, {
            versionKey: false,
            timestamps: true
        });

        usuarioSchema.plugin(mongoosePaginate);
        this.model = mongoose.model("usuarios", usuarioSchema);
    }
}

export default new Usuario().model;