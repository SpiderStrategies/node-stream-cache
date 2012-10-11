var Redis = require('./redis')
  , es = require('event-stream')

var Cache = function (opts) {
  opts = opts || {}
  this.store = opts.store || new Redis(opts)
  this.prefix = this.store.prefix = (opts.ns || 'c') + ':'
}

module.exports = Cache

Cache.prototype.get = function (key) {
  return this.store.get(key)
}

Cache.prototype.set = function (key, stream, ttl, cb) {
  this.store.set(key, stream, ttl, cb)
}

Cache.prototype.remove = function (key) {
  this.store.remove(key)
}

Cache.prototype.process = function (key, work, done, ttl) {
  var stream = this.store.get(key)
    , self = this

  var s = es.mapSync(function (data) {
    if (!data || data == -1) {
      var response = work.apply(null)
      self.store.set(key, response, ttl, function (err, resp) {
        done.call(null, response)
      })
    } else {
      done.call(null, s)
    }
    return data
  })
  stream.pipe(s)
}
