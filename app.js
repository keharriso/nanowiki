var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var crypto = require('crypto');

function error(req, res, err, message) {
  var error = err;
  if (message !== undefined) {
    error = createError(err || 500, message);
  }
  // render the error page
  res.status(error.status);
  res.render('error', {
    app_title: 'nanowiki',
    page_title: 'nanowiki - Error ' + error.status,
    message: error.message,
    error: req.app.get('env') === 'development' ? error : {}
  });
}

function createApp(model) {
  var indexRouter = require('./routes/index')(model, error);
  var editRouter = require('./routes/edit')(model, error);
  var readRouter = require('./routes/read')(model, error);

  var app = express();

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  app.use(logger('dev'));
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/', indexRouter);
  app.use('/edit', editRouter);
  app.use('/read', readRouter);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {
    error(req, res, err);
  });

  return app;
}

module.exports = createApp;
