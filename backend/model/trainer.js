const mongoose=require('mongoose')

const trainerSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phonenumber:{
        type:String,
        required:true
    },
    skills:{
        type:[String],
        required:true
    },
    experience:{
        type:String,
       default:'none'
    },
    profilephoto:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:'pending'
    },
    password:{
        type:String
    },
    clients:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'users',
            default:[]
        },
    ],
    pendingClients:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'users'
        }
    ],
    
})

const Trainer=mongoose.model('trainer',trainerSchema)
module.exports=Trainer