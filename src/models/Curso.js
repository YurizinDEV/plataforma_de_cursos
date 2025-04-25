import mongoose from "mongoose";  
import mongoosePaginate from "mongoose-paginate-v2";  

// Cursos Class  
class Curso {  
    constructor() {  
        const cursoSchema = new mongoose.Schema({  
            curs_id_curso_pk: { type: Number, index: true, required: true },  
            curs_titulo: { type: String, required: true, maxlength: 100 },  
            curs_descricao: { type: String, required: false },  
            curs_criado_em: { type: Date, default: Date.now },  
            curs_thumbnail: { type: String, required: false, maxlength: 250 },  
            curs_material_complementar: { type: String, maxlength: 45 },  
            curs_professor: { type: String, maxlength: 45 },  
            curs_tags: { type: [String], required: false },  
            curs_usua_id_usuario_admin_fk: { type: Number, required: true }  
        });  
    }  
}  

