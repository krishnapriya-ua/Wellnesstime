const mongoose=require('mongoose')

const musicSchema=new mongoose.Schema({
   name:{
    type:String,
    required:true
   },
   files:{
    type:[String],
    required:true
   },
   category:{
    type:[String],
    required:true
   }
})

const Music=mongoose.model('Music',musicSchema);
module.exports=Music;