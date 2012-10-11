var Redis = require('redis-stream')
  , es = require('event-stream')

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

Store.prototype.set = function (key, stream, ttl) {
  var command
  if (ttl) {
    command = this.client.stream('setex', this.prefix + key, ttl)
  } else {
    command = this.client.stream('set', this.prefix + key)
  }

  // Why can't I pipe this?
  //stream.pipe(command)

  // This blows
  var response = ''
  stream.on('data', function (data) {
    response += JSON.stringify(data)
  })
  stream.on('end', function () {
    command.write(response)
  })
}
