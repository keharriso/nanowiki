var express = require('express');
var router = express.Router();

function writeRouter(model, error) {
  /* GET write page. */
  router.get('/', function(req, res, next) {
    var writeId = req.query.id;
    model.Story.findOne({ writeId: writeId }, function(err, story) {
      if (err) {
        error(req, res, 500, 'Failed to fetch story.');
      } else if (!story) {
        error(req, res, 404, 'This story doesn\'t exist!');
      } else {
        res.render('write', {
          app_title: 'nanowiki',
          page_title: story.title + ' - nanowiki',
          story_title: story.title,
          write_id: story.writeId,
          read_id: story.readId
        });
        story.viewed = Date.now();
        story.edited = Date.now();
        story.save();
      }
    });
  });

  return router;
}

module.exports = writeRouter;
