const mongoose = require("mongoose");

const Schema = mongoose.Schema;
var bcrypt = require("bcrypt");



const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  userPhoto:{
    type:String,
    required:true,
  }, 
  payments: [{ type: Schema.Types.ObjectId, ref:'payments' }],
  created_at    : { type: Date },
  updated_at    : { type: Date }
});

// hash the password
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};


const user = mongoose.model("users", userSchema); //1. name of collection, 2. schema

//export
module.exports = user;
