import mongoose from "mongoose";  
import mongoosePaginate from "mongoose-paginate-v2";  

class Questionario {  
    constructor() {  
        const questionarioSchema = new mongoose.Schema({  
            ques_id_quest_pk: { type: Number, index: true, required: true },  
            ques_enunciado: { type: String, required: true },  
            ques_resposta_correta: { type: Number, required: true },  
            ques_numero: { type: Number, required: true },  
            ques_id_curso_fk: { type: Number, required: true }  
        });  
    }  
}  

