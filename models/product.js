const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title:{
        type : String,
        required:true
    },
    shape:{
        type : String,
        required:true
    },
    quantity:{           // all quantity
        type : Number,
        required:true
    },
    factory:{
        type : String,
        required:true
    },
    price:{
        type : Number,
        required:true
    },
    salePrice:{           
        type : Number,
        required:true
    },
    titer:{           
        type : Number,
        required:true
    }
})

module.exports = mongoose.model('Product' ,productSchema);