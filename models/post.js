const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://ayushsjain0:123@cluster0.sz0t5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(console.log("datbase 1 connected"));
 const postschema=mongoose.Schema({
    user:{
   type: mongoose.Schema.Types.ObjectId,
   ref:"user",
    },
    date:{
        type:Date,
        default:Date.now,
    },
    content:String,
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user", 
    }]


})
module.exports=mongoose.model('post',postschema)