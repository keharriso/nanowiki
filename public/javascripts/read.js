var sock = io();

var entries = [];

var story_title = $('#nanowiki-story-title');

sock.emit('WatchStory', 'read', readId);

sock.on('ChangeTitle', function(title) {
	var pageTitle = 'nanowiki - ' + title;
	if (document.title !== pageTitle) {
		story_title.text(title);
		document.title = pageTitle;
	}
});

sock.on('DeleteStory', function() {
	window.location.href = '/';
});

var story_body = $('#nanowiki-story-body');

sock.on('AddEntry', function(id, previous, author, content) {
  var entryNode = $('<p></p>');
  var entry = {
    id: id,
    author: author,
    content: content,
    node: entryNode
  };
  entryNode.text(content);
  if (!previous) {
    entries.unshift(entry);
    story_body.prepend(entryNode);
  } else {
    var i;
    for (i = entries.length-1; i >= 0; --i) {
      var p = entries[i];
      if (p.id === previous) {
        break;
      }
    }
    if (i >= 0) {
      entries.splice(i + 1, 0, entry);
      var previousNode = entries[i].node;
      previousNode.after(entryNode);
    }
  }
});

sock.on('EditEntry', function (id, author, content) {
  var i;
  for (i = entries.length-1; i >= 0; --i) {
    if (entries[i].id === id) {
      var entry = entries[i];
      entry.author = author;
      entry.content = content;
      entry.node.text(content);
      break;
    }
  }
});

sock.on('DeleteEntry', function (id) {
  for (var i = entries.length-1; i >= 0; --i) {
    if (entries[i].id === id) {
      entries[i].node.remove();
      entries.splice(i, 1);
      break;
    }
  }
});
