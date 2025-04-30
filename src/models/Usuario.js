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
            criadoEm: {
                type: Date,
                default: Date.now
            },
            cursosIds: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Curso"
            }]
        }, {
            versionKey: false
        });

        usuarioSchema.plugin(mongoosePaginate);
        this.model = mongoose.model("Usuario", usuarioSchema);
    }
}



/*
class Usuario {  
    constructor() {  
        const usuarioSchema = new mongoose.Schema({  
            usua_id_usuario_pk: { type: Number, index: true, required: true },  
            usua_nome: { type: String, required: true, maxlength: 50 },  
            usua_senha: { type: String, required: true, maxlength: 255 },  
            usua_email: { type: String, required: true, maxlength: 100 },  
            usua_eh_admin: { type: Boolean, default: false },  
            usua_criado_em: { type: Date, default: Date.now }  
        });  
    }  
}  
*/