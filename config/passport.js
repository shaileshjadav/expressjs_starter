const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
var bcrypt = require("bcrypt");

//model
const User = require("../src/models/userModel");

module.exports = passport => {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      //(options,callback)

      //Match user
      User.findOne({ email: email })
        .then(user => {
          if (!user) {
            return done(null, false, {
              message: "That email is not registered!"
            });
          } else {
            // Match password

            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;
              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: "password incorrect!" });
              }
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    })
  );
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id,'_id', function(err, user) {
      done(err, user.id); // save only user id in sesssion
    });
  });
};
