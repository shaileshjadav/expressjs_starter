const { check, validationResult } = require("express-validator");
var bcrypt = require("bcrypt");
var jwt = require('jsonwebtoken');
var moment = require('moment');

//model
const User = require("../../../models/userModel");
const paymentModel = require("../../../models/paymentModel");
const userLoginValidationRules = () => {
    return [
        check("email")
        .notEmpty()
        .withMessage("email is required")
        .isEmail()
        .withMessage("Please Enter valid email"),
      check("password")
        .notEmpty()
        .withMessage("password is required"),
    ]
  }

const savePaymentValidationRules = () => {
  return [
      check("userId")
      .notEmpty()
      .withMessage("userId is required"),
      
    check("payment_amount")
      .notEmpty()
      .withMessage("Payment amount is required"),
  ]
}

  const validate = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }
    const extractedErrors = []
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))
  
    return res.status(422).json({
        'message':"Validation Errors",
        errors: extractedErrors,
    })
  }
  
module.exports={
    getAll: (req, res,next) => {
        
        User.find({},'_id name email')
            .then(users=>{
                var response={'message':"done",users:users};
                res.status(200).json(response);
            })
            .catch(err=>{
                if(err){
                    var response={'message':err,users:[]};
                    res.status(200).json(response);
                }
            })
    },

    getUser: (req,res,next)=>{
        const {id}=req.params;
        
        User.findById(id,'_id name email')
            .then(user=>{
                if(!user){
                    user=[];
                }
                var response={'message':"done",user};
                res.status(200).json(response);
            })
            .catch(err=>{
                if(err){
                    var response={'message':err};
                    res.status(403).json(response);
                }
            })
    },
    // login for user
    validate, // common for all validations

    userLoginValidationRules, //rules for login only
    
    login:(req, res,next) => {
        const { email, password } = req.body;

        let result = {};
        let status = 200;

        User.findOne({ email:email },'_id name email userPhoto password created_at').lean()
        .then(user => {
          if (!user) {
            
            status = 404;
            result.status = status;
            result.message = `Such Email not found!`;
            res.status(status).json(result);

          } else {
            // Match password
            bcrypt.compare(password, user.password).then(match => {
                if (match) {
                  status = 200;
                  // Create a token
                  const payload = { user: user._id };
                //   const options = { expiresIn: '2d', issuer: 'https://scotch.io' };
                  const options={};
                  const secret = process.env.JWT_SECRET;
                  const token = jwt.sign(payload, secret, options);
                    
                  delete user["password"];
                  delete user["__v"];
                  
                  user.token=token;
                  result.status = status;
                  result.result = user;
                } else {
                  status = 401;
                  result.status = status;
                  result.error = `Authentication error`;
                  result.message="Password was incorrect!"
                }
                res.status(status).json(result);
              }).catch(err => {
               
                status = 500;
                result.status = status;
                result.error = err;
                res.status(status).send(result);
            });
            
          }
        })
        .catch(err => {
            status = 500;
            result.status = status;
            result.error = err;
            res.status(status).json(result);
        });
    },
    getProfile: (req,res,next)=>{
      const payload = req.decoded;
      const userId=payload.user;

      var status=200;
      var result={};

      User
      .findOne({_id:userId},'_id name email')
      .populate("payments",'paymentAmount created_at')
      .lean()
      .then(user=>{
          if(!user){
              user=[];
          }else{
            user.payments.map(payment=>{
              payment.created_at=moment(payment.created_at).format("YYYY-MM-DD HH:mm:ss")
            })
          }
          result.status = status;
          result.message="done";
          result.result=user;

          res.status(status).json(result);
      })
      .catch(err=>{
          status = 500;
          result.status = status;
          result.error = err;
          res.status(status).send(result);
      })

    },
    savePaymentValidationRules,

    savePayment: (req,res,next)=>{
      // const payload = req.decoded;
      const {userId,payment_amount}=req.body;

      var status=200;
      var result={};
      var newPayment= new paymentModel({
        userId,
        paymentAmount:payment_amount,
        created_at:new Date()
      });

      newPayment
          .save()
          .then(data=>{

            //update in users collections
            User.updateOne({_id:userId},
            { 
              "$push": {
                payments: data._id
              }
            })
            .then(done=>{
              if(done){
                result.status = status;
                result.result = data;
                result.message="done"

                res.status(status).send(result);
              }
            })
            .catch(err=>{
              console.log(err);
              
              status = 500;
              result.status = status;
              result.error = err;
              res.status(status).send(result);
            })
            
          })
          .catch(err=>{
           
            status = 500;
            result.status = status;
            result.error = err;
            res.status(status).send(result);
          });
    
    },

};