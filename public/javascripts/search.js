var search_sort = $('#nanowiki-search-sort');

function getUrlParameter(sParam) {
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	var sParameterName;
	var i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
		}
	}
}

var sort = getUrlParameter('sort');

search_sort.val(sort);

search_sort.change(function() {
	location.href = '/search?query=' + getUrlParameter('query') + '&page=' + 0 + '&sort=' + search_sort.val();
});
