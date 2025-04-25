import mongoose from "mongoose";  
import mongoosePaginate from "mongoose-paginate-v2";  

class Alternativa {  
    constructor() {  
        const alternativaSchema = new mongoose.Schema({  
            ale_id: { type: Number, index: true, required: true },  
            ale_texto: { type: String, required: true, maxlength: 250 },  
            ale_numero: { type: Number, required: true },  
            ale_ques_id_quest_fk: { type: Number, required: true }  
        });  
    }  
}  