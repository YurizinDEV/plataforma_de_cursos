import mongoose from "mongoose";  
import mongoosePaginate from "mongoose-paginate-v2";  

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
