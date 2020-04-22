const fs = require("fs");
const path = require("path");

const BASE_DIR = path.join(__dirname, "/../src/controllers/");
const MIDDLEWARE_DIR = path.join(__dirname, "/../src/middlewares/");

//define Middle wares
const middlewares = require(MIDDLEWARE_DIR + "middlewares");

//define routes
const registation = require(BASE_DIR + "register");
const Login = require(BASE_DIR + "login");
const userDashboard = require(BASE_DIR + "userDashboard");
const forgotPassword = require(BASE_DIR + "forgotPassword");

module.exports = app => {
    //---- Load routes -- //
    app.use(middlewares.init); // for get all global vars
    app.use("/", registation);
    app.use("/login", Login);
    app.use("/user/dashboard", middlewares.authentication, userDashboard);
    app.use("/forgotPassword",forgotPassword);
};