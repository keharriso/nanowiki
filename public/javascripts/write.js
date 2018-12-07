var sock = io();

var entries = [];

sock.emit('WatchStory', 'write', writeId);

function trapReturn(e) {
  // trap the return key being pressed
  if (e.keyCode === 13) {
		this.blur();
		var selection = window.getSelection();
		selection.removeAllRanges();
    // prevent the default behaviour of return key pressed
    return false;
  }
}

function getTooltip(author) {
  return 'written by ' + author;
}

// Keep title on a  single line
$('.single-line[contenteditable]').keydown(trapReturn);

var story_title_bar = $('#nanowiki-story-title-bar');
var story_title = $('#nanowiki-story-title');

sock.on('ChangeTitle', function(title) {
	var pageTitle = title + ' - nanowiki';
	if (document.title !== pageTitle) {
		story_title.text(title);
		document.title = pageTitle;
	}
});

var story_author = $('#nanowiki-story-author');

story_author.focus(function() {
	document.execCommand('selectAll', false, null);
});

story_author.focusout(function() {
	if (story_author.text().trim() === '') {
		story_author.text('anonymous');
	}
});

sock.on('DeleteStory', function() {
	window.location.href = '/';
});

var share_story = $('#nanowiki-story-share');

share_story.click(function() {
  window.open('/read?id=' + readId);
});

var story_body = $('#nanowiki-story-body');
var entry_controls = $('#nanowiki-entry-controls');
var story_insertion = $('#nanowiki-story-insertion');
var story_insert = $('#nanowiki-story-insert');
var story_compose = $('#nanowiki-story-compose');

story_insert.click(function() {
  if (!story_compose.is(':focus')) {
    story_compose.focus();
  }
});

story_compose.focus(function() {
	story_insertion.hide();
	story_compose.text('compose here');
	document.execCommand('selectAll', false, null);
});

story_compose.focusout(function() {
	var content = story_compose.text();
	sock.emit('AppendEntry', writeId, story_author.text(), content);
	story_compose.text('');
	story_insertion.show();
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
      entry.node.attr('title', getTooltip(author));
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
