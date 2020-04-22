var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
const passport = require("passport");
var jwt = require('jsonwebtoken');
// send mail helper
const  {transporter,resetPasswordTemplate} =require("../../helpers/emails");


//model
const User = require("../models/userModel");

/* render view. */

router.get("/", function(req, res, next) {
  res.render("forgotPassword");
});

//Process
router.post(
  "/submitForm",
  [
    check("email")
        .notEmpty()
        .withMessage("Email is required")  
        .isEmail()
        .withMessage("Please Enter valid email"),
  ],
  (req, res, next) => {
  
    var errors = validationResult(req).errors;
    
    if (errors.length > 0) {
      req.flash("errors", errors);
      res.redirect('/forgotPassword');
    } else {
      //check user exists
      const { email } = req.body
      const usePasswordHashToMakeToken = ({
        password: passwordHash, // extract as variable
        _id: userId,
        created_at: createdAt
      }) => {
        // highlight-start
        const secret = passwordHash + "-" + createdAt
        
        const token = jwt.sign({ userId }, secret, {
          expiresIn: 3600 // 1 hour
        })
        // highlight-end
         return token
      }

      User
      .findOne({email})
      .then(user=>{
        if(user){
            //process to send token
            const token = usePasswordHashToMakeToken(user);
            const url = process.env.BASE_URL+`forgotPassword/reset/${user._id}/${token}`;
            // console.log(url);
            const emailTemplate = resetPasswordTemplate(user, url)
        
            //send mail
            transporter.sendMail(emailTemplate, (err, info) => {
            if (err) {
                // res.status(500).json("Error sending email")
                
              req.flash("error", "Error sending email");
              res.redirect("/forgotPassword");

            }else{
              // res.status(200).json("sent succesffully");

              req.flash("success", "Please check your inbox!");
              res.redirect("/forgotPassword");
              
            }
        })
        }else{
            req.flash("error", "No such email exists!");
            res.redirect("/forgotPassword");
        }
      })
      .catch(err => {
          console.log(err)
        req.flash("error", "Opps! goes wrong");
        res.redirect("/forgotPassword");
       });
    }
  }
);

router.get("/reset/:userId/:token", function(req, res, next) {
  const { userId, token } = req.params
  res.render("resetPassword",{userId,token});
});
//handle new password 
const validateBody = [
  check("password")
    .notEmpty()
      .withMessage("password is required")
    .isLength({ min: 8 })
      .withMessage("Password must alteast 8 chars"),
  check('confirm_password', ' Confirm Password field must have the same value as the password field')
    .notEmpty()
      .withMessage("Confirm Password is required")
    .exists()
    .custom((value, { req }) => value === req.body.password)
];

router.post("/updatePassword/:userId/:token", validateBody, function(req, res, next) {
  const { userId, token } = req.params
  var errors = validationResult(req).errors;
    
  if (errors.length > 0) {
   
    req.flash("errors", errors);
    res.redirect(`/forgotPassword/reset/${userId}/${token}`);
   
  }else{
    User
      .findById(userId)
      .then(user=>{
        const secret = user.password + "-" + user.createdAt
        const payload = jwt.decode(token, secret);
        if (payload.userId === user.id) {

          if(req.body.password){
           
            var new_user = new User();
            
            User
              .updateOne({_id:userId},{password: new_user.generateHash(req.body.password)})
              .then(done=>{
                if(done){
                  req.flash("success", "password updated successfully!");
                  res.redirect("/forgotPassword");
                }
              })
              .catch(err=>{
                console.log(err);
                res.json(err);
              })
          }
           
        }else{
          req.flash("error", "Invalid Token!");
          res.redirect(`/forgotPassword/reset/${userId}/${token}`);
        }
      })
      .catch(err => {
        req.flash("error", "Invalid user!");
        res.redirect(`/forgotPassword/reset/${userId}/${token}`);
      })
  }
});

module.exports = router;
