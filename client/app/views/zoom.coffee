BaseView = require 'lib/base_view'
request = require 'lib/request'
graphHelper = require '../lib/graph'
normalizer = require 'lib/normalizer'

MainState = require '../main_state'


# Item View for the albums list
module.exports = class ZoomView extends BaseView
    className: ''
    el: '#zoom-view'
    template: require 'views/templates/zoom'


    events:
        'blur input.zoomtitle': 'onCurrentTrackerChanged'
        'blur textarea.zoomexplaination': 'onCurrentTrackerChanged'
        'change #zoomtimeunit': 'onComparisonChanged'
        'change #zoomstyle': 'onStyleChanged'
        'change #zoomcomparison': 'onComparisonChanged'
        'keyup #zoomgoal': 'onGoalChanged'
        'click #remove-btn': 'onRemoveClicked'
        'click #back-trackers-btn': 'onBackTrackersClicked'


    constructor: (@model, @basicTrackers) ->
        super


    afterRender: ->


    show: (slug) ->
        super

        tracker = @basicTrackers.findWhere slug: slug

        unless tracker?
            alert "Tracker does not exist"
        else
            @$("h2.zoomtitle").html tracker.get 'name'
            @$("p.zoomexplaination").html tracker.get 'description'

            # non edit mode by default
            @$("h2.zoomtitle").show()
            @$("p.zoomexplaination").show()
            @$("input.zoomtitle").hide()
            @$("textarea.zoomexplaination").hide()
            @$("#show-data-section").hide()

            # Get data
            data = MainState.data[tracker.get 'slug']
            @model.set 'tracker', tracker
            @$("#zoomstyle").val tracker.get('metadata').style or 'bar'
            @$("#zoomgoal").val tracker.get('metadata').goal or ''

            # Set average
            @showAverage data
            @showEvolution data

            @fillComparisonCombo()
            @printZoomGraph data, tracker.get 'color'


    showAverage: (data) ->
        average = 0
        average += amount.y for amount in data
        average = average / data.length
        average = Math.round(average * 100) / 100
        @$("#average-value").html average


    showEvolution: (data) ->
        if data.length in [0, 1]
            evolution = 0
        else
            length = data.length
            if data.length < 14
                middle = length / 2
            else
                middle = 7

            newTrend = 0
            i = middle
            while i > 0
                newTrend += data[length - i - 1].y
                i--
            oldTrend = 0
            i = middle
            while i > 0
                oldTrend += data[length - middle - i - 1].y
                i--

            if oldTrend isnt 0
                evolution =  (newTrend / oldTrend) * 100 - 100
            else
                evolution = 0

        evolution = Math.round(evolution * 100) / 100
        @$("#evolution-value").html evolution + " %"


    reload: ->
        tracker = @model.get 'tracker'
        if tracker?
            data = MainState.data[tracker.get 'slug']
            @printZoomGraph data, tracker.get 'color'


    printZoomGraph: (data, color, graphStyle, comparisonData, time, goal) ->
        graphStyle ?= @$("#zoomstyle").val() or 'bar'
        goal ?= @$("#zoomgoal").val() or null

        width = $(window).width() - 140
        el = @$('#zoom-charts')[0]
        yEl = @$('#zoom-y-axis')[0]

        graphHelper.clear el, yEl
        graph = graphHelper.draw {
            el, yEl, width, color, data, graphStyle, comparisonData, time, goal
        }
        timelineEl = @$('#timeline')[0]
        @$('#timeline').html null

        annotator = new Rickshaw.Graph.Annotate
            graph: graph
            element: @$('#timeline')[0]

        #for note in @notes.models
            #date = moment(note.get 'date').valueOf() / 1000
            #annotator.add date, note.get 'text'

            #annotator.update()


    onRemoveClicked: =>
        slug = @model.get('tracker').get 'slug'
        data =
            hidden: true
        request.put "basic-trackers/#{slug}", data, (err) ->

        window.app.router.navigateHome()


    onBackTrackersClicked: (event) =>
        window.app.router.navigateHome()
        event.preventDefault()


    onStyleChanged: =>
        style = @$("#zoomstyle").val()

        if style in ['bar', 'line', 'point']
            slug = @model.get('tracker').get 'slug'
            data =
                style: style
            request.put "basic-trackers/#{slug}", data, (err) ->

        @onComparisonChanged()


    onGoalChanged: =>
        slug = @model.get('tracker').get 'slug'
        data =
            goal: parseInt @$("#zoomgoal").val()
        request.put "basic-trackers/#{slug}", data, (err) ->


    onComparisonChanged: =>
        val = @$("#zoomcomparison").val()
        timeUnit = @$("#zoomtimeunit").val()
        graphStyle = @$("#zoomstyle").val()
        tracker = @model.get 'tracker'
        data = MainState.data[tracker.get 'slug']
        time = true # true if x axis should show dates.

        # Check if it's a comparison.
        if val.indexOf('basic') isnt -1
            slug = val.substring 6
            comparisonData = MainState.data[slug]

        else
            comparisonData = null

        # Define timeUnit
        if timeUnit is 'week'
            data = graphHelper.getWeekData data
            if comparisonData?
                comparisonData = graphHelper.getWeekData comparisonData

        else if timeUnit is 'month'
            data = graphHelper.getMonthData data
            if comparisonData?
                comparisonData = graphHelper.getMonthData comparisonData

        # Normalize data
        if comparisonData?
            {data, comparisonData} = graphHelper.normalizeComparisonData(
                data, comparisonData
            )

        if graphStyle is 'correlation' and comparisonData?
            data = graphHelper.mixData data, comparisonData

            comparisonData = null
            graphStyle = 'scatterplot'
            time = false

        # Chose color
        if comparisonData?
            color = 'black'
        else
            color = tracker.get 'color'

        @printZoomGraph data, color, graphStyle, comparisonData, time


    fillComparisonCombo: ->
        combo = @$ "#zoomcomparison"
        combo.append """
<option value=\"undefined\">Select the tracker to compare</option>"
"""
#combo.append "<option value=\"moods\">Moods</option>"

        #for tracker in @trackerList.collection.models
            #option = "<option value="
            #option += "\"#{tracker.get 'id'}\""
            #option += ">#{tracker.get 'name'}</option>"
            #combo.append option

        for tracker in @basicTrackers.models
            option = "<option value="
            option += "\"basic-#{tracker.get 'slug'}\""
            option += ">#{tracker.get 'name'}</option>"
            combo.append option
