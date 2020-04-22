var express = require("express");
var router = express.Router();

const path = require("path");
const { check, validationResult } = require("express-validator");
let multer = require("multer");

//model
const user = require("../models/userModel");

/* registratin form */
router.get("/", function(req, res, next) {
  res.render("register", { title: "Welcome|Register" });
});


/* file upload with multer */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/users");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

var upload = multer({
  storage: storage,
  limits: { fileSize: 1024*1024*2 }, // 2 MB

  fileFilter: (req, file, cb) => {
    var ext = path.extname(file.originalname).toLowerCase();
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      req.fileValidationError = "Please select image only!";
      cb(null, false, new Error("goes wrong on the mimetype"));
    }
    cb(null, true);
  }
});

//save form data
function validateImage(req, res, next) {
    var avtarUpload = upload.single("image");
    
    avtarUpload(req, res, function(err) {
        if (req.fileValidationError) {
            req.fileValidationError=req.fileValidationError;
            // return res.send(req.fileValidationError);
        }
        else if (err && err.code == "LIMIT_FILE_SIZE") {
            req.fileValidationError="file is too large(Max:2 MB)";
            // return res.send("file is too large");
        }
        else if (!req.file) {
            req.fileValidationError="Please select an image to upload";
            // return res.send('Please select an image to upload');
        }
        else if (err instanceof multer.MulterError) {
            // return res.send(err);
            req.fileValidationError=err;
        }
        else if (err) {
            req.fileValidationError=err;
            // return res.send(err);
        }
        // goes to next middleware, otherwise terminates process
        next();   
    });
    
    
  }

  const validateBody = [
    check("name")
      .notEmpty()
      .withMessage("Name is required"),
    check("email")
      .isEmail()
      .withMessage("Please Enter valid email"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password must alteast 8 chars")
    // .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)
    // .withMessage("Password is not in correct format!!")
  ];

router.post("/",  validateImage,validateBody, function(req,res,next){
      var errors = validationResult(req).array();

      if (req.fileValidationError) {
        errors.push({ msg: req.fileValidationError, param: "image" });
      }
      //validation errors exits
      if (errors.length > 0) {
          res.render("register", { errors: errors, data:req.body});
      }
      else{
         //save in db
         var {name, email,password}=req.body;
         var fileName=req.file.filename;
         //check email is unique
          user.exists({ email: email }, (err1, isExist) => {
              if(err1){
                req.flash("error", "Opps! Something went wrong");
                res.redirect("/");
              }else{
                if (isExist) {
                  req.flash("error", "Email is already registered");
                  res.redirect("/");
                }else{
                  var new_user = new user({
                    name: name,
                    email: email,
                    userPhoto:fileName,
                    created_at:new Date()
                  });
                  
                  new_user.password = new_user.generateHash(password);
                  new_user
                  .save()
                  .then(user => {
                    req.flash("success", "Registration successful, Now can login!");
                    res.redirect("/");
                  })
                  .catch(err => {
                   req.flash("error", "Opps! goes wrong");
                   res.redirect("/");
                  });
                } 
              }
          });
         
        
      }
});

module.exports = router;
