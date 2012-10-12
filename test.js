var Cache = require('./index.js')
  , cacher = new Cache
  , request = require('request')
  , JSONStream = require('JSONStream')
  , es = require('event-stream')

var work = function () {
  var parser = JSONStream.parse(['rows', true])
    , req = request({url: 'http://isaacs.couchone.com/registry/_all_docs'})

  req.pipe(parser)
  return parser
}

var done = function (stream) {
  stream.pipe(es.mapSync(function (data) {
                console.error(data)
                return data
              }))
}

cacher.process('docs', work, done, 60)
