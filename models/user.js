const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://ayushsjain0:123@cluster0.sz0t5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(console.log("database 2 connected"))
 const userschema=mongoose.Schema({
    username:String,
    name:String,
    email:String,
    password:String,
    age:Number,
    posts:[{type:mongoose.Schema.Types.ObjectId, ref:
        "post"
    }],

})
module.exports=mongoose.model('user',userschema)