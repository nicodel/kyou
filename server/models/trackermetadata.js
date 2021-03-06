// Generated by CoffeeScript 1.9.3
var TrackerAmount, TrackerMetadata, americano, date_helpers;

americano = require('cozydb');

date_helpers = require('../lib/date');

TrackerAmount = require('./trackeramount');

module.exports = TrackerMetadata = americano.getModel('TrackerMetadata', {
  type: String,
  slug: String,
  style: String,
  goal: Number,
  hidden: {
    type: Boolean,
    "default": false
  }
});

TrackerMetadata.all = function(params, callback) {
  return TrackerMetadata.request('all', params, callback);
};

TrackerMetadata.get = function(slug, callback) {
  return TrackerMetadata.request('bySlug', {
    key: slug
  }, function(err, metadatas) {
    if (err) {
      return callback(err);
    } else if (metadatas.length === 0) {
      return callback(null, null);
    } else {
      return callback(null, metadatas[0]);
    }
  });
};

TrackerMetadata.allHash = function(callback) {
  return TrackerMetadata.all(function(err, metadatas) {
    var i, len, metadata, metadataHash;
    if (err) {
      return callback(err);
    }
    metadataHash = {};
    for (i = 0, len = metadatas.length; i < len; i++) {
      metadata = metadatas[i];
      metadataHash[metadata.slug] = metadata;
    }
    return callback(null, metadataHash);
  });
};
