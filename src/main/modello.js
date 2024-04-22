import mongoose from "mongoose";

const schema = mongoose.Schema({
    contatti:Array,
    file:String,
    scadenza:String,
    azienda:String,
    closed:{
        type:Boolean,
        default:false
    },
    selfNotify:{
        type:Boolean,
        default:true
    },
    notificato:{
        type:Array,
        default:[false,false,false]
    }
});

export default mongoose.model("ref",schema);