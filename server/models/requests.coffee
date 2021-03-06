americano = require 'cozydb'

module.exports =
    mood:
        all: americano.defaultRequests.all
        statusByDay: (doc) ->
            status = 0
            status = 1 if doc.status is "bad"
            status = 2 if doc.status is "neutral"
            status = 3 if doc.status is "good"
            emit doc.date.substring(0,10), status
        byDay: (doc) ->
            emit doc.date.substring(0,10), doc

    trackermetadata:
        all: americano.defaultRequests.all
        bySlug: (doc) -> emit doc.slug, doc

    tracker:
        all: americano.defaultRequests.all
        byName: (doc) -> emit doc.name, doc

    trackeramount:
        all: americano.defaultRequests.all
        nbByDay: (doc) ->
            emit [doc.tracker, doc.date.substring(0,10)], doc.amount
        byDay: (doc) ->
            emit [doc.tracker, doc.date.substring(0,10)], doc

    dailynote:
        byDay: (doc) ->
            emit doc.date.substring(0,10), doc
