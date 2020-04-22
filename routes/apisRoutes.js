const fs = require("fs");
const path = require("path");

const BASE_DIR_V1 = path.join(__dirname, "/../src/controllers/apis/v1/");
const validateToken = require('../helpers/utils').validateToken;

//define routes
const users = require(BASE_DIR_V1 + "users");

module.exports=(router)=>{
   //user routes 
    router.route(`/users`)
        .post(users.getAll)

    router.route(`/user/:id`)
        .get(users.getUser);
    
    router.route(`/login`)
        .post(users.userLoginValidationRules(), users.validate, users.login);
    
    router.route(`/profile`)
        .post(validateToken, users.getProfile);

    router.route(`/savePayment`)
        .post(validateToken, users.savePaymentValidationRules(),users.validate,users.savePayment);
    //end: user routes

    return router;
}
