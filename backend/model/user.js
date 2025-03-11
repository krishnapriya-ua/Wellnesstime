const mongoose=require('mongoose')

const userschema =new mongoose.Schema({
    firstname:{
        type:String,
        required:false
    },
    lastname:{
        type:String,
        required:false
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phonenumber:{
        type:String,
        unique:false,
        sparse:true,
       required:false,
      
     
    },
    password:{
        type:String,
        default:null
    },
    profilephoto:{
        type:String,
        default:null
    },
    blocked: { type: Boolean, default: false },
    googleId:{
        type:String,
        unique:true
    },
    linkedinId:{
        type:String,
        unique:true
    },
    otp: { type: String }, 
    otpExpiry: { type: Date },
    isVerified: { type: Boolean, default: false },
    workouts:[
        {
            workoutId:{type:mongoose.Schema.Types.ObjectId,ref:'Workout'},
            workoutName:{type:String},
            duration:{type:Number},
            date:{type:Date,default:Date.now()}
        }
    ],
    height:{
        type:String,
        required:false
    },
    weight:{
        type:String,
        required:false
    },
    sleepSchedule:{
        type:String,
        required:false
    },
    preferences:{
        type:[String],
        default:[]
    },
    diet:{
        type:String,
        required:false
    },
    goals:{
        type:[String],
        default:[]
    },
    premium:{type:Boolean,default:false},
    premiumExpiresAt:{type:Date,default:null},
    trainer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'trainer'
    },
    trainerStatus:{
        type:String,
        enum:['pending','rejected','assigned','none'],
        default:'none'
    }

   
}, { timestamps: true })

const User=mongoose.model('users',userschema)
module.exports=User