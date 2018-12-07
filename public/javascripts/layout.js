var search_box = $('#nanowiki-search-box');
var search_button = $('#nanowiki-search-button');

$('#nanowiki-header').click(function() {
	location.href = '/';
});

function search() {
	var searchTerms = search_box.val().split(/\s+/);
	if (searchTerms.length > 0) {
		for (var i = 0; i < searchTerms.length; ++i)
			searchTerms[i] = encodeURIComponent(searchTerms[i]);
		location.href = '/search?query=' + searchTerms.join('+') + '&page=' + 0 + '&sort=popularity';
	}
}

search_box.on('keydown', function(e) {
  if(e.keyCode == 13) {
		search();
  }
});

search_button.click(search);
