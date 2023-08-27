const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    email:{
        type:String,
        required:true,
        unique : true
    },
    password:{
        type:String,
        required:true
    },
    name:{
        type :String,
        required : true
    },
    pharmaId :{
        type : Schema.Types.ObjectId,
        ref : 'Admin',
        required : true
    },
    verificationCode:{
        type : Number
    },
    phoneNumber:{
        type : Number,
        required:true
    }
});


module.exports=mongoose.model('User',userSchema)

