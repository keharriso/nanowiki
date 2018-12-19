var sock = io();

sock.on('EditStory', function (id) {
	window.location.href = '/edit?id=' + encodeURIComponent(id);
});

$('#nanowiki-create-story').click(function() {
	sock.emit('CreateStory');
});

var featured_stories = $('#nanowiki-featured-stories');
var featured_stories_header = $('<h2 id="featured-header">');
featured_stories_header.addClass('big-font');
featured_stories_header.text('Featured');
featured_stories.append(featured_stories_header);

sock.on('GetFeaturedStories', function(stories) {
	stories.forEach(function(story) {
		var storyLink = $('<a></a>');
		storyLink.addClass('featured-story');
		storyLink.addClass('search-result');
		storyLink.addClass('big-font');
		storyLink.attr('href', '/read?id=' + story.readId);
		let storyTitle = $('<h3>').text(story.title);
		storyLink.append(storyTitle);
		var storyContent = $('<span></span>');
		storyContent.text(story.content);
		storyLink.append(storyContent);
		featured_stories.append(storyLink);
	});
});

sock.emit('GetFeaturedStories');
