var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
let multer = require("multer");

//model
// const user = require("../models/userModel");

/* registratin form */

router.get("/", function(req, res, next) {
  res.render("register", { title: "Welcome|Register" });
});

//var upload = multer(); // when upload none and content-type:form-data

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
  limits: { fileSize: 1000*1 }, // 2 MB

  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "image/jpeg") {
      req.fileValidationError = "goes wrong on the mimetype";
      cb(null, false, new Error("goes wrong on the mimetype"));

      //cb(new Error("goes wrong on the mimetype"), false);
    }
    cb(null, true);
  }
});


function validator(req,res,next){
    
    var avtarUpload = upload.single("image");
    avtarUpload(req, res, function(err) {

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
        var errors = validationResult(req);
        
 
        if (!errors.isEmpty()) {
            console.log('text validation FAILED');
            // return errors.array();
            return res.status(400).json({
                errors: errors.array()
            });
        }
        else{
            console.log("avatar uploda called");
            console.log(req.body);
            // req.file contains information of uploaded file
            // req.body contains information of text fields, if there were any
        
            if (req.fileValidationError) {
                return res.send(req.fileValidationError);
            }
            else if (err && err.code == "LIMIT_FILE_SIZE") {
                return res.send("file is too large");
                
            }
            else if (!req.file) {
                return res.send('Please select an image to upload');
            }
            else if (err instanceof multer.MulterError) {
                return res.send(err);
            }
            else if (err) {
                return res.send(err);
            }

        }
    });


    next();
}
//save form data
function validateUser(req, res, next) {
    var avtarUpload = upload.single("image");
    

    avtarUpload(req, res, function(err) {
        if (req.fileValidationError) {
            req.fileValidationError=req.fileValidationError;
            // return res.send(req.fileValidationError);
        }
        else if (err && err.code == "LIMIT_FILE_SIZE") {
            req.fileValidationError="file is too large";
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

        next();   
    });
    
    // goes to next middleware, otherwise terminates process
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

router.post("/",  validateUser,validateBody, function(req,res,next){
      var errors = validationResult(req).array();

      if (req.fileValidationError) {
        errors.push({ msg: req.fileValidationError, param: "image" });
      }
      if (errors.length > 0) {
        console.log('text validation FAILED');
        // return errors.array();
        // return res.status(400).json({
        //     errors: errors.array()
        // });
        res.render("register", { errors: errors });
        
        }
        else{
            res.send("done");
        }
});

module.exports = router;
