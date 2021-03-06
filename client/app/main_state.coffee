{DATE_FORMAT, DATE_URL_FORMAT} = require '../lib/constants'

now = moment()


# Data shared by all application widgets.
module.exports = mainState =

    startDate: now
    endDate: now
    currentView: 'main'

    data: {}

    getData: (slug) ->
        data = mainState.data[slug]

        unless data?
            data = {}
            data[mainState.startDate.format DATE_URL_FORMAT] = 0
            data[mainState.endDate.format DATE_URL_FORMAT] = 0

        return data

