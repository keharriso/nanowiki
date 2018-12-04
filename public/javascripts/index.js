var sock = io();

sock.on('EditStory', function (id) {
	window.location.href = '/edit?id=' + encodeURIComponent(id);
});

$('#CreateStoryButton').click(function() {
	sock.emit('CreateStory');
});
