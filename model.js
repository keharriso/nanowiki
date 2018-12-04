var crypto = require('crypto');
var mongoose = require('mongoose');
var debug = require('debug')('nanowiki:model');

function model(mongoURI) {
	debug('Initializing MongoDB connection: ' + mongoURI);
	mongoose.promise = global.Promise;
	mongoose.connect(mongoURI, { useNewUrlParser: true });
	var db = mongoose.connection;
	return populate(db);
}

function populate(db) {
	var schemas = {};
	var model = {};
	debug('Initializing schemas');
	var entrySchema = new mongoose.Schema({
		id: String,
		author: String,
		content: String
	}, {
		_id: false
	});
	schemas.Story = new mongoose.Schema({
		editId: String,
		readId: String,
		title: {type: String, default: ''},
		created: {type: Date, default: Date.now},
		edited: {type: Date, default: Date.now},
		viewed: {type: Date, default: Date.now},
		entries: [entrySchema]
	});
	schemas.Story.static('generateId', function(type, callback, depth) {
		if (!depth)
			depth = 0;
		if (depth > 1000) {
			callback('failed to generate unique ID (' + type + ')');
		} else {
			var idName = type + 'Id';
			var id = model.generateId();
			model.Story.findOne({ [idName]: id }, '-_id', function(err, story) {
				if (err) {
					callback(err);
				} else if (!story) {
					callback(null, id);
				} else {
					model.Story.generateId(type, callback, depth + 1);
				}
			});
		}
	});
	schemas.Story.static('create', function(callback) {
		model.Story.generateId('edit', function(err, editId) {
			if (err) {
				callback(err);
			} else {
				model.Story.generateId('read', function(err, readId) {
					if (err) {
						callback(err);
					} else {
						var story = new model.Story({
							editId: editId,
							readId: readId,
							title: 'My Story',
							entries: []
						});
						story.save(callback);
					}
				});
			}
		});
	});
	schemas.Story.static('expire', function(lifetime, callback) {
		const expireDate = new Date();
		expireDate.setDate(expireDate.getDate() - lifetime);
		model.Story.countDocuments({viewed: {$lt: expireDate}}, function(err, count) {
			if (err) {
				debug(err);
			} else {
				model.Story.deleteMany({viewed: {$lt: expireDate}}, function (err) {
					if (err) {
						debug(err);
					} else {
						callback(null, count);
					}
				});
			}
		});
	});
	debug('Initializing models');
	for (var name in schemas)
		model[name] = mongoose.model(name, schemas[name]);
	model.generateId = function() {
		var id = crypto.randomBytes(9).toString('base64');
		return id.replace('+', '-').replace('/', '_');
	};
	return model;
}

module.exports = model;