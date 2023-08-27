const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const purchaseSchema = new Schema({
    adminId:{
        type : Schema.Types.ObjectId,
        ref:'Admin'
    },
    productId : {
        type : Schema.Types.ObjectId,
        ref:'Product'
    },
    userId:{
        type : Schema.Types.ObjectId,
        ref:'User'
    },
    anotherItem:{
        type:String,
        required:false
    },
    price: {           // for single product ((not all the quantity))
        type : Number,
        required : true
    },
    quantity:{      // quantity in this Invoice
        type : Number,
        default:1
    }
},{timestamps:true});

module.exports = mongoose.model('Purchase' ,purchaseSchema);