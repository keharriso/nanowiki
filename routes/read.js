var express = require('express');
var router = express.Router();

function readRouter(model, error) {
  /* GET read page. */
  router.get('/', function(req, res, next) {
    var readId = req.query.id;
    model.Story.findOne({ readId: readId }, function(err, story) {
      if (err) {
        error(req, res, 500, 'Failed to fetch story.');
      } else if (!story) {
        error(req, res, 404, 'This story doesn\'t exist!');
      } else {
        res.render('read', {
          app_title: 'nanowiki',
          page_title: story.title + ' - nanowiki',
          story_title: story.title,
          read_id: readId
        });
        story.viewed = Date.now();
        story.save();
      }
    });
  });

  return router;
}

module.exports = readRouter;
