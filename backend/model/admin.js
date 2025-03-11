const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  totalRevenue: { type: Number, default: 0 },
  revenueHistory:[
    {
        date:{type:String,required:true},
        revenue:{type:Number,required:true},
        userName:{type:String,required:true},
        userEmail:{type:String,required:true},
        planName:{type:String,required:true}

    }
  ]
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
