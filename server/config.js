// Generated by CoffeeScript 1.9.3
var americano, config;

americano = require('americano');

config = {
  common: [
    americano.bodyParser(), americano.methodOverride(), americano.errorHandler({
      dumpExceptions: true,
      showStack: true
    }), americano["static"](__dirname + '/../client/public', {
      maxAge: 86400000
    })
  ],
  development: [americano.logger('dev')],
  production: [americano.logger('short')],
  plugins: ['cozydb']
};

module.exports = config;
