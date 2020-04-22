const mongoose = require("mongoose");

const Schema = mongoose.Schema;
var bcrypt = require("bcrypt");

const adminSchema = new Schema({
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
  }
});

// hash the password
adminSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
adminSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

const admin = mongoose.model("admin", adminSchema); //1. name of collection, 2. schema

//export
module.exports = admin;
