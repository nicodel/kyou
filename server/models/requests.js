// Generated by CoffeeScript 1.9.3
var americano;

americano = require('cozydb');

module.exports = {
  mood: {
    all: americano.defaultRequests.all,
    statusByDay: function(doc) {
      var status;
      status = 0;
      if (doc.status === "bad") {
        status = 1;
      }
      if (doc.status === "neutral") {
        status = 2;
      }
      if (doc.status === "good") {
        status = 3;
      }
      return emit(doc.date.substring(0, 10), status);
    },
    byDay: function(doc) {
      return emit(doc.date.substring(0, 10), doc);
    }
  },
  trackermetadata: {
    all: americano.defaultRequests.all,
    bySlug: function(doc) {
      return emit(doc.slug, doc);
    }
  },
  tracker: {
    all: americano.defaultRequests.all,
    byName: function(doc) {
      return emit(doc.name, doc);
    }
  },
  trackeramount: {
    all: americano.defaultRequests.all,
    nbByDay: function(doc) {
      return emit([doc.tracker, doc.date.substring(0, 10)], doc.amount);
    },
    byDay: function(doc) {
      return emit([doc.tracker, doc.date.substring(0, 10)], doc);
    }
  },
  dailynote: {
    byDay: function(doc) {
      return emit(doc.date.substring(0, 10), doc);
    }
  }
};
