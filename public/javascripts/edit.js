var sock = io();

var entries = [];
var activeEntry = 'bottom';

sock.emit('WatchStory', 'edit', editId);

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

story_title.focus(function() {
	document.execCommand('selectAll', false, null);
});

story_title.focusout(function() {
	if (story_title.text().trim() === '') {
		story_title.text('<untitled>');
	}
	sock.emit('ChangeTitle', editId, story_title.text());
});

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

var delete_story = $('#nanowiki-story-delete');

delete_story.click(function() {
	if (window.confirm('Are you sure you want to delete this story? This cannot be undone.')) {
		sock.emit('DeleteStory', editId);
	}
});

sock.on('DeleteStory', function() {
	window.location.href = '/';
});

var share_story = $('#nanowiki-story-share');

share_story.click(function() {
  window.open('/read?id=' + readId);
});

var write_story = $('#nanowiki-story-write');

write_story.click(function() {
  window.open('/write?id=' + writeId);
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
  var activeId = activeEntry;
  if (activeEntry !== 'top' && activeEntry !== 'bottom')
    activeId = activeEntry.id;
  sock.emit('StartEdit', 'edit', editId, activeId, story_author.text());
});

story_compose.focusout(function() {
	var content = story_compose.text();
  var activeId = null;
  if (activeEntry === 'top' || (activeEntry === 'bottom' && entries.length === 0)) {
    activeId = null;
  } else if (activeEntry === 'bottom') {
    activeId = entries[entries.length-1].id;
  } else {
    activeId = activeEntry.id;
  }
	sock.emit('InsertEntry', editId, activeId, story_author.text(), content);
	story_compose.text('');
	story_insertion.show();
  sock.emit('EndEdit', 'edit', editId, activeEntry);
});

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
  entryNode.addClass('single-line');
  entryNode.attr('contenteditable', 'true');
  entryNode.attr('title', getTooltip(author));
  entryNode.text(content);
  entryNode.keydown(trapReturn);
  entryNode.hover(function() {
    if (!story_compose.is(':focus')) {
      entry_controls.detach();
      entryNode.after(entry_controls);
      activeEntry = entry;
    }
  });
  entryNode.focus(function() {
    sock.emit('StartEdit', 'edit', editId, entry.id, author);
  });
  entryNode.focusout(function() {
  	var content = entryNode.text();
  	sock.emit('EditEntry', editId, id, story_author.text(), content);
    sock.emit('EndEdit', 'edit', editId, entry.id);
  });
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

story_title.hover(function() {
  if (entries.length > 0 && !story_compose.is(':focus')) {
    entry_controls.detach();
    story_body.before(entry_controls);
    activeEntry = 'top';
  }
});
