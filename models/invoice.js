const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const invoiceSchema = new Schema({
    products:[
      {
        productId : {
            type : Schema.Types.ObjectId,
            ref:'Product',
            required:true
        },
        quantity:{      // quantity in this Invoice
            type : Number,
            required:true
        },
      }  
    ],
    salerId: {
        type : Schema.Types.ObjectId
    }
});

module.exports = mongoose.model('Invoice' ,invoiceSchema);