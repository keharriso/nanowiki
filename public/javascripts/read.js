var sock = io();

var entries = [];

function getTooltip(author) {
  return 'written by ' + author;
}

var story_title = $('#nanowiki-story-title');

sock.emit('WatchStory', 'read', readId);

sock.on('ChangeTitle', function(title) {
	var pageTitle = title + ' - nanowiki';
	if (document.title !== pageTitle) {
		story_title.text(title);
		document.title = pageTitle;
	}
});

sock.on('DeleteStory', function() {
	window.location.href = '/';
});

var story_body = $('#nanowiki-story-body');

var edits = {};

function removeEdit(clientId) {
	if (edits[clientId]) {
		var edit = edits[clientId];
		edit.node.remove();
		delete edits[clientId];
	}
}

function addEdit(edit) {
  edit.node = $('<p></p>');
  edit.node.addClass('nanowiki-edit-node');
  edit.node.text('... ' + edit.author + ' is writing ...');
  if (edit.entryId === 'top') {
    story_title_bar.after(edit.node);
  } else if (edit.entryId === 'bottom') {
    story_body.after(edit.node);
  } else {
    for (var i = 0; i < entries.length; ++i) {
      if (entries[i].id === edit.entryId) {
        entries[i].node.after(edit.node);
        break;
      }
    }
  }
  edits[edit.clientId] = edit;
}

sock.on('StartEdit', function(edit) {
	removeEdit(edit.clientId);
	addEdit(edit);
});

sock.on('EndEdit', function(clientId) {
	removeEdit(clientId);
});

sock.on('InsertEntry', function(id, previous, author, content) {
  var entryNode = $('<p></p>');
  var entry = {
    id: id,
    author: author,
    content: content,
    node: entryNode
  };
	entryNode.attr('title', getTooltip(author));
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
