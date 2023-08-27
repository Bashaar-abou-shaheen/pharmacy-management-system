const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema =new Schema ({
    email:{
        type : String,
        required : true,
        unique : true
    },
    password:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:Number,
        required:true
    },
    pharmaName:{
        type:String,
        required:true
    },
    pharmaLocation:{
        type:String,
        required:true
    },
    pharmaId:{
        type:Number,
        required:true,
        unique : true    
    },
    //  لشراء الأدوية 
    products:{
        items:[
            {
                productId : {
                    type :Schema.Types.ObjectId,
                    ref:'Product',
                    // required:true
                },
                expirationDate:{
                    type : Date,
                    required:true
                }
            }
        ]
    },
    //للموظفين
    users:{
        userInformation:[
            {
                userId:{
                    type:Schema.Types.ObjectId,
                    ref:'User',
                },
                salary:{
                    type:Number,
                    default:0
                },
                workShift:{
                    type:String,
                    default:"Morning"
                }
            }
        ]
    },
    verificationCode:{
        type : Number
    }
});    

module.exports=mongoose.model('Admin',adminSchema);
