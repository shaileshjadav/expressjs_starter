var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
const session = require("express-session");

//model
const User = require("../models/userModel");
/* GET home page. */

router.get("/", function(req, res, next) {
   let userId=req.user;
  
  User
    .findById(userId,'name email userPhoto')
    .then(user=>{
      res.render("userdashboard", { user });
    })
    .catch(err => {
      req.flash("error", "Opps! goes wrong");
      res.redirect("/login");
     });  
});
const validateBody = [
  check("name")
    .notEmpty()
    .withMessage("Name is required"),
  check("password")
  .if((value, { req }) => req.body.password)
    .isLength({ min: 8 })
      .withMessage("Password must alteast 8 chars"),
];
//updata data
router.post("/update",validateBody, async function(req,res,next){
  let userId=req.user;
    
  var errors = validationResult(req);
 
  if (!errors.isEmpty()) {
 

   //get data from db
    User
    .findById(userId,'name email userPhoto')
    .then(user=>{
      // res.json(errors.array()); return;
      res.render("userdashboard", { user, errors:errors.array() });
    })
    .catch(err => {
      req.flash("error", "Opps! goes wrong");
      res.redirect("/login");
     }); 
  }else{
   //update query
   var updateData={}; 
   updateData["name"]=req.body.name;
   if(req.body.password){
    var new_user = new User();
    updateData["password"]=new_user.generateHash(req.body.password);
    // updateData.push({password: new_user.generateHash(req.body.password)})
   }
   
    User
      .updateOne({_id:userId},{$set:updateData})
      .then(done=>{
        if(done){
          req.flash("success", "Profile saved successfully!");
          res.redirect("/user/dashboard");
        }
      })
      .catch(err=>{
        console.log(err);
        res.json(err);

      })
  }
})


module.exports = router;
