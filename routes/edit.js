var express = require('express');
var router = express.Router();

function editRouter(model, error) {
  /* GET edit page. */
  router.get('/', function(req, res, next) {
    var editId = req.query.id;
    model.Story.findOne({ editId: editId }, function(err, story) {
      if (err) {
        error(req, res, 500, 'Failed to fetch story.');
      } else if (!story) {
        error(req, res, 404, 'This story doesn\'t exist!');
      } else {
        res.render('edit', {
          app_title: 'nanowiki',
          page_title: story.title + ' - nanowiki',
          story_title: story.title,
          read_id: story.readId,
          edit_id: editId
        });
        story.viewed = Date.now();
        story.edited = Date.now();
        story.save();
      }
    });
  });

  return router;
}

module.exports = editRouter;
