var sock = io();

sock.on('EditStory', function (id) {
	window.location.href = '/edit?id=' + encodeURIComponent(id);
});

$('#nanowiki-create-story').click(function() {
	sock.emit('CreateStory');
});

var featured_stories = $('#nanowiki-featured-stories');
var featured_stories_header = $('<p></p>');
featured_stories_header.addClass('big-font');
featured_stories_header.text('Featured stories:');
featured_stories.append(featured_stories_header);

sock.on('GetFeaturedStories', function(stories) {
	stories.forEach(function(story) {
		var storyItem = $('<li></li>');
		storyItem.addClass('featured-story');
		var storyLink = $('<a></a>');
		storyLink.addClass('search-result');
		storyLink.addClass('big-font');
		storyLink.attr('href', '/read?id=' + story.readId);
		storyLink.text(story.title);
		storyItem.append(storyLink);
		var storyContent = $('<span></span>');
		storyContent.text(' - ' + story.content);
		storyItem.append(storyContent);
		featured_stories.append(storyItem);
	});
});

sock.emit('GetFeaturedStories');
