var express = require('express');
var router = express.Router();

function indexRouter(model) {
  /* GET home page. */
  router.get('/', function(req, res, next) {
    res.render('index', {
      app_title: 'nanowiki',
      page_title: 'nanowiki'
    });
  });

  return router;
}

module.exports = indexRouter;
