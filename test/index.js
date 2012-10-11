var Cache = require('../lib/')
  , assert = require('assert')
  , redis = require('redis')
  , client = redis.createClient()
  , fs = require('fs')
  , Stream = require('stream')

describe('Stream Cache', function () {
  var cache, stream

  it('sets an item in the cache', function (done) {
    cache.set('index.js', stream, 60, function (err, data) {
      client.get(cache.prefix + 'index.js', function (err, res) {
        assert.equal(data, res)
        done()
      })
    })
  })

  it('removes an item from the cache', function (done) {
    cache.set('index.js', stream, 60, function (err, data) {
      cache.remove('index.js')
      client.get('index.js', function (err, res) {
        assert(!res)
        done()
      })
    })
  })

  it('gets an item from the cache', function (done) {
    cache.set('index.js', stream, 60, function (err, data) {
      var res = cache.get('index.js')
      assert(res instanceof Stream)
      res.on('data', function (d) {
        assert.equal(data, d)
        done()
      })
    })
  })

  it('does work if cache is empty', function (done) {
    var invoked = false
    var work = function () {
      invoked = true
      return stream
    }
    var finish = function (s) {
      assert(invoked)
      done()
    }
    cache.process('foo', work, finish, 10)
  })

  it('bypasses work if cached', function (done) {
    cache.set('foo', stream, 60, function () {
      var invoked = false
      var work = function () { invoked = true }
      var finish = function (s) {
        assert(!invoked)
        done()
      }
      cache.process('foo', work, finish, 10)
    })
  })

  beforeEach(function () {
    cache = new Cache({ns: 'c:test'})
    stream = fs.createReadStream(__filename, { encoding: 'utf-8' })
  })

  afterEach(function (done) {
    client.keys(cache.prefix + '*', function (err, keys) {
      keys.forEach(function (key) {
        client.del(key)
      })
      done()
    })
  })

})
