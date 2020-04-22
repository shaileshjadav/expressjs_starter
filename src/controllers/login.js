var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
const passport = require("passport");
//model
const User = require("../models/userModel");

/* render view. */

router.get("/", function(req, res, next) {
  res.render("login");
});

//Login Process
router.post(
  "/",
  [
    check("email")
      .isEmail()
      .withMessage("Please Enter valid email"),
    check("password")
      .notEmpty()
      .withMessage("password is required"),
  ],
  
  (req, res, next) => {
  
    var errors = validationResult(req).errors;
    if (errors.length > 0) {
      res.render("login", { errors: errors });
    } else {
      //passport startegy
    
      passport.authenticate("local", {
        successRedirect: "/user/dashboard",
        failureRedirect: "/login",
        failureFlash: true
      })(req, res, next);
      
       
    
        
    
    }
  }
);

//Logout
router.get("/logout", (req, res, next) => {
  // passport statergies
  req.logOut();
  req.flash("success", "Successfully Logout!!! Bye");
  res.redirect("/login");

  // delete req.session.user;
  // res.redirect("/login");
});
module.exports = router;
