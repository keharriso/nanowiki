var express = require('express');
var router = express.Router();

var MAX_SEARCH_TERMS = 32;
var RESULTS_PER_PAGE = 16;
var MAX_PAGES = 20;

function searchRouter(model, error) {
  /* GET search page. */
  router.get('/', function(req, res, next) {
    var query = req.query.query || '';
    var page = parseInt(req.query.page);
    var sort = req.query.sort || 'popularity';
    var searchTerms = query.split('+').slice(0, MAX_SEARCH_TERMS);
    var aggregation = [];
    searchTerms.forEach(function (term) {
      aggregation.push({ $match: { title: { $regex: term, $options: 'i' } } });
    });
    aggregation.push({ $project: { readId: 1, title: 1, titleLength: { $strLenCP: '$title' }, entries: 1 } });
    if (sort === 'title') {
      aggregation.push({ $sort: { title: 1 } });
    } else if (sort === 'popularity') {
      aggregation.push({ $sort: { popularity: -1 } });
    }
    aggregation.push({ $project: { readId: 1, title: 1, entries: 1 } });
    aggregation.push({
      $facet: {
        results: [{ $skip: page * RESULTS_PER_PAGE }, { $limit: RESULTS_PER_PAGE }],
        totalCount: [{ $count: 'count' }]
      }
    });
    model.Story.aggregate(aggregation, function (err, results) {
      if (err) {
        error(req, res, 500, 'Failed to perform search: ' + err);
      } else {
        var results = results[0];
        var count = results.totalCount[0] ? results.totalCount[0].count : 0;
        var pageCount = Math.min(MAX_PAGES, Math.ceil(count / RESULTS_PER_PAGE));
        results.results.forEach(function(result) {
          result.content = model.getContent(result, 90);
        });
        res.render('search', {
          app_title: 'nanowiki',
          page_title: 'Search - nanowiki',
          query: query,
          results: results.results,
          page: page,
          resultsPerPage: RESULTS_PER_PAGE,
          count: count,
          pageCount: pageCount,
          sort: sort
        });
      }
    });
  });

  return router;
}

module.exports = searchRouter;
