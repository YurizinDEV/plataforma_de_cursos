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
                select: false,
                required: true
            },
            email: {
                type: String,
                required: true,
                unique: true
            },
            ehAdmin: {
                type: Boolean,
                default: false
            },
            ativo: {
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
            }],
            tokenUnico: { 
                type: String, 
                select: false 
            }, 
            codigo_recupera_senha: { 
                type: String,
                select: false
            },
            exp_codigo_recupera_senha: { 
                type: Date,
                select: false
            },
            refreshtoken: { 
                type: String, 
                select: false 
            }, 
            accesstoken: { 
                type: String, 
                select: false 
            }
        }, {
            versionKey: false,
            timestamps: true
        });

        usuarioSchema.plugin(mongoosePaginate);
        this.model = mongoose.model("Usuario", usuarioSchema);
    }
}

export default new Usuario().model;