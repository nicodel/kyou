// Generated by CoffeeScript 1.9.3
var Tracker, TrackerAmount, TrackerMetadata, async, basicTrackers, moment, normalizer, slugify;

moment = require('moment');

async = require('async');

slugify = require('cozy-slug');

Tracker = require('../models/tracker');

TrackerAmount = require('../models/trackeramount');

TrackerMetadata = require('../models/trackermetadata');

normalizer = require('../lib/normalizer');

basicTrackers = require('../lib/trackers')();

module.exports = {
  loadDay: function(req, res, next, day) {
    req.day = moment(req.params.day);
    req.day.hours(0, 0, 0, 0);
    return next();
  },
  loadTracker: function(req, res, next, trackerId) {
    return Tracker.request('all', {
      key: trackerId
    }, function(err, trackers) {
      if (err) {
        return next(err);
      } else if (trackers.length === 0) {
        console.log('Tracker not found');
        return res.send({
          error: 'not found'
        }, 404);
      } else {
        req.tracker = trackers[0];
        return next();
      }
    });
  },
  loadMetadataTracker: function(req, res, next, slug) {
    return TrackerMetadata.get(slug, function(err, metadata) {
      if (err) {
        return next(err);
      }
      req.metadata = metadata;
      return next();
    });
  },
  loadTrackerAmount: function(req, res, next, trackerAmountId) {
    return TrackerAmount.request('all', {
      key: trackerAmountId
    }, function(err, amounts) {
      if (err) {
        return next(err);
      } else if (amounts.length === 0) {
        console.log('Amount not found');
        return res.send({
          error: 'not found'
        }, 404);
      } else {
        req.amount = amounts[0];
        return next();
      }
    });
  },
  allBasicTrackers: function(req, res, next) {
    return TrackerMetadata.allHash(function(err, metadataHash) {
      var i, len, metadata, results, tracker;
      if (err) {
        console.log(err);
      }
      if (metadataHash == null) {
        metadataHash = {};
      }
      results = [];
      for (i = 0, len = basicTrackers.length; i < len; i++) {
        tracker = basicTrackers[i];
        metadata = metadataHash[tracker.slug];
        tracker.metadata = metadata || {};
        delete tracker.request;
        results.push(tracker);
      }
      return res.send(results);
    });
  },
  all: function(req, res, next) {
    return Tracker.request('byName', function(err, trackers) {
      if (err) {
        return next(err);
      } else {
        return res.send(trackers);
      }
    });
  },
  create: function(req, res, next) {
    return Tracker.create(req.body, function(err, tracker) {
      if (err) {
        return next(err);
      } else {
        return res.send(tracker);
      }
    });
  },
  update: function(req, res, next) {
    return req.tracker.updateAttributes(req.body, function(err) {
      if (err) {
        return next(err);
      } else {
        return res.send({
          success: true
        });
      }
    });
  },
  destroy: function(req, res, next) {
    return TrackerAmount.destroyAll(req.tracker, function(err) {
      if (err) {
        return next(err);
      } else {
        return req.tracker.destroy(function(err) {
          if (err) {
            return next(err);
          } else {
            return res.send({
              success: true
            });
          }
        });
      }
    });
  },
  day: function(req, res, next) {
    return req.tracker.getAmount(req.day, function(err, trackerAmount) {
      if (err) {
        return next(err);
      } else if (trackerAmount != null) {
        return res.send(trackerAmount);
      } else {
        return res.send({});
      }
    });
  },
  updateDayValue: function(req, res, next) {
    return req.tracker.getAmount(req.day, function(err, trackerAmount) {
      var data;
      if (err) {
        return next(err);
      } else if (trackerAmount != null) {
        trackerAmount.amount = req.body.amount;
        return trackerAmount.save(function(err) {
          if (err) {
            return next(err);
          } else {
            return res.send(trackerAmount);
          }
        });
      } else {
        data = {
          amount: req.body.amount,
          date: req.day,
          tracker: req.tracker.id
        };
        return TrackerAmount.create(data, function(err, trackerAmount) {
          if (err) {
            return next(err);
          } else {
            return res.send(trackerAmount);
          }
        });
      }
    });
  },
  amounts: function(req, res, next) {
    var day, id, params;
    id = req.tracker.id;
    day = moment(req.day);
    params = {
      startkey: [id],
      endkey: [id + "0"],
      descending: false
    };
    return TrackerAmount.rawRequest('nbByDay', params, function(err, rows) {
      var data, i, len, row, tmpRows;
      if (err) {
        return next(err);
      } else {
        tmpRows = [];
        for (i = 0, len = rows.length; i < len; i++) {
          row = rows[i];
          tmpRows.push({
            key: row['key'][1],
            value: row['value']
          });
        }
        data = normalizer.normalize(tmpRows, day);
        return res.send(normalizer.toClientFormat(data));
      }
    });
  },
  rawData: function(req, res, next) {
    return req.tracker.getAmounts(function(err, trackerAmounts) {
      if (err) {
        return next(err);
      } else {
        return res.send(trackerAmounts);
      }
    });
  },
  rawDataCsv: function(req, res, next) {
    return req.tracker.getAmounts(function(err, trackerAmounts) {
      var amount, contentHeader, data, date, i, len;
      if (err) {
        return next(err);
      } else {
        data = req.tracker.name + ",\n";
        data = 'date,amount\n';
        for (i = 0, len = trackerAmounts.length; i < len; i++) {
          amount = trackerAmounts[i];
          date = moment(amount.date).format('YYYY-MM-DD');
          data += date + "," + amount.amount + "\n";
        }
        res.setHeader('content-type', 'application/csv');
        contentHeader = "inline; filename=" + req.tracker.name + ".csv";
        res.setHeader('Content-Disposition', contentHeader);
        res.setHeader('Content-Length', data.length);
        return res.send(data);
      }
    });
  },
  rawDataDelete: function(req, res, next) {
    return req.amount.destroy(function(err) {
      if (err) {
        return next(err);
      } else {
        return res.send({
          success: true
        }, 204);
      }
    });
  },
  allData: function(req, res, next) {
    var options, results;
    results = {};
    options = {
      group: true
    };
    return async.eachSeries(basicTrackers, function(tracker, done) {
      var requestName;
      requestName = tracker.requestName || 'nbByDay';
      return tracker.model.rawRequest(requestName, options, function(err, rows) {
        results[tracker.slug] = normalizer.toClientFormat(rows);
        return done();
      });
    }, function(err) {
      return res.send(results);
    });
  },
  getMetadata: function(req, res, next) {
    var data;
    if (req.metadata != null) {
      return res.send(req.metadata);
    } else {
      data = {
        slug: req.params.slug
      };
      return TrackerMetadata.create(date, function(err, metadata) {
        if (err) {
          return next(err);
        }
        return res.send(metadata);
      });
    }
  },
  updateMetadataBasic: function(req, res, next) {
    var data;
    data = req.body;
    if (req.metadata != null) {
      return req.metadata.updateAttributes(data, function(err, metadata) {
        if (err) {
          return next(err);
        }
        return res.send(metadata);
      });
    } else {
      data.slug = req.params.slug;
      return TrackerMetadata.create(data, function(err, metadata) {
        if (err) {
          return next(err);
        }
        return res.send(metadata);
      });
    }
  },
  "export": function(req, res, next) {
    var requestName, slug, tracker, trackers;
    slug = req.params.slug;
    trackers = basicTrackers.filter(function(tracker) {
      return tracker.slug === slug;
    });
    if (trackers.length > 0) {
      tracker = trackers[0];
      requestName = tracker.requestName || 'nbByDay';
      return tracker.model.rawRequest(requestName, {
        group: true
      }, function(err, rows) {
        var csv, csvFile, i, len, row;
        if (err) {
          return next(err);
        }
        csv = [];
        for (i = 0, len = rows.length; i < len; i++) {
          row = rows[i];
          csv.push(row.key + "," + row.value);
        }
        csvFile = csv.join('\n');
        res.setHeader('Content-length', csvFile.length);
        res.setHeader('Content-disposition', "attachment; filename=" + (slug + '.csv'));
        res.setHeader('Content-type', 'application/csv');
        return res.send(csvFile);
      });
    } else {
      return res.status(404).send({
        error: 'Tracker was not found'
      });
    }
  }
};
