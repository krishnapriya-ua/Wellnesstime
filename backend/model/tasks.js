const mongoose=require('mongoose')

const taskschema=new mongoose.Schema({
    trainerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'trainer',
        required:true
    },
    clientId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    tasks:[
        {
            taskname:{type:String,required:true},
            completed:{type:Boolean,default:false},
            date:{type:Date,required:true}
        }
    ],
  

})

const Task=mongoose.model('task',taskschema)
module.exports=Task