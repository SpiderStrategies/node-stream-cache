var Redis = require('redis-stream')
  , noop = function () {}

var Store = function (opts) {
  opts = opts || {}
  this.client = new Redis(opts.port, opts.host, opts)
}

module.exports = Store

Store.prototype.get = function (key, cb) {
  var get = this.client.stream('get')
  get.write(this.prefix + key)
  return get
}

Store.prototype.remove = function (key) {
  var del = this.client.stream('del')
  del.write(this.prefix + key)
  del.end()
}

Store.prototype.set = function (key, stream, ttl, cb) {
  cb = cb || noop
  var command = this.client.stream('append', this.prefix + key)
    , self = this

  command.on('end', function () {
    if (ttl) {
      var s = self.client.stream('expire', self.prefix + key)
      s.write(ttl)
      s.end()
    }
    cb(null)
  })
  return stream.pipe(command)
}
