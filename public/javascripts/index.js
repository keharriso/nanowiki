var sock = io();

sock.on('EditStory', function (id) {
	window.location.href = '/edit?id=' + encodeURIComponent(id);
});

$('#nanowiki-create-story').click(function() {
	sock.emit('CreateStory');
});

function createStoryNode(story) {
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
	return storyLink;
}

var featured_stories = $('#nanowiki-featured-stories');
var featured_stories_header = $('<h2 id="featured-header">');
featured_stories_header.addClass('big-font');
featured_stories_header.text('Featured');
featured_stories.append(featured_stories_header);

sock.on('GetFeaturedStories', function(stories) {
	stories.forEach(function(story) {
		var storyNode = createStoryNode(story);
		featured_stories.append(storyNode);
	});
});

sock.emit('GetFeaturedStories');


var new_stories = $('#nanowiki-new-stories');
var new_stories_header = $('<div id="new-stories-header">');
var new_header = $('<h2 id="new-header">');
new_header.addClass('big-font');
new_header.text('New');
new_stories_header.append(new_header);
new_stories_header.append($('<a href="./search?query=&page=0&sort=popularity">View More &gt;&gt; </a>'));
new_stories.append(new_stories_header);

sock.on('GetNewStories', function(stories) {
	stories.forEach(function(story) {
		var storyNode = createStoryNode(story);
		new_stories.append(storyNode);
	});
});

sock.emit('GetNewStories');
