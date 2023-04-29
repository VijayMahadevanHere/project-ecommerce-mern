let  createError = require('http-errors');
let express = require('express');
let  path = require('path');
let  cookieParser = require('cookie-parser');
let  logger = require('morgan');
const expressLayouts = require("express-ejs-layouts");
const session= require('express-session')
const nocache=require('nocache')


require('dotenv').config();

//db connection


let userRouter = require('./routes/user');
let adminRouter = require('./routes/admin');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "public/admin-assets")));
app.use(session({secret:"key", resave: true,saveUninitialized: true,cookie:{maxAge:600000}}))
app.use(nocache());


app.use('/', userRouter);
app.use('/admin', adminRouter);

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
