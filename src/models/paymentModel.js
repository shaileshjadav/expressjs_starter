const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  userId: {
    type:String,
    required: true
  },
  paymentAmount: {
    type: Number,
    required: true
  },    
},
{ 
  timestamps: { 
    createdAt: 'created_at',
    updatedAt:'updated_at', 
  } 
}
);

const user = mongoose.model("payments", paymentSchema); //1. name of collection, 2. schema

//export
module.exports = user;
