const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const saleSchema = new Schema({
    productId : {
        type : Schema.Types.ObjectId,
        ref:'Product'
    },
    price : {           // for single product ((not all the quantity))
        type : Number,
        required : true
    },
    quantity:{      // quantity in this Invoice
        type : Number,
        required:true
    },
    adminId:{
        type : Schema.Types.ObjectId,
        ref:'Admin'
    }
},{timestamps:true});

module.exports = mongoose.model('Sale' ,saleSchema);