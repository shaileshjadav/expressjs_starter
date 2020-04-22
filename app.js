require("dotenv").config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require("body-parser");
const router = express.Router();

//installed packages
var session = require("express-session");
var database = require("./config/database");
const passport = require("passport")
//passport config
require("./config/passport")(passport);

// session in db with mongodb
const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
  uri: process.env.DB_HOST ,
  collection: "sessions"
});

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "src/views"));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
/* custom */
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

//set session config
var sess = {
  resave: true,
  saveUninitialized: true,
  secret: "keepitSecret",
 
  // store: new MemoryStore({
  //   checkPeriod: 86400000 // prune expired entries every 24h
  // }),

  unset: "destroy",
  store: store,

};
app.use(session(sess));

//flash msg
var flash = require("connect-flash");
app.use(flash());

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}

// Init passport authentication 
app.use(passport.initialize());
// persistent login sessions 
app.use(passport.session());


/* end session config */



// Load and initialize the controllers.
require("./routes/controllersLoader")(app);
const apisRoutes_v1= require("./routes/apisRoutes");

app.use('/api/v1', apisRoutes_v1(router));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
