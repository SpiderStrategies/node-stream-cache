var Cache = require('../lib/')
  , assert = require('assert')
  , redis = require('redis')
  , client = redis.createClient()
  , fs = require('fs')
  , Stream = require('stream')

describe('Stream Cache', function () {
  var cache, stream

  it('sets an item in the cache', function (done) {
    cache.set('index.js', stream, 60, function (err) {
      client.get(cache.prefix + 'index.js', function (err, res) {
        assert(res)
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

  it('processes and sets', function (done) {
    cache.process('index2.js', function () {
      return fs.createReadStream(__filename, { encoding: 'utf-8' })
    }, function (res) {
      assert(res instanceof Stream)
      client.get('c:test:index2.js', function (err, answer) {
        cache.process('index2.js', function () { return null }, function (r2) {
          r2.on('data', function (d) {
            assert.equal(d, answer)
            done()
          })
        }, 60)
      })
    }, 60)
  })

  it('gets an item from the cache as a stream', function (done) {
    cache.set('index.js', stream, 60, function (err) {
      var res = cache.get('index.js')
      assert(res instanceof Stream)
      res.on('data', function (d) {
        assert(d)
        done()
      })
    })
  })

  it('does work if cache is empty', function (done) {
    var work = function () {
      done()
      return stream
    }
    cache.process('foo', work, function () {}, 10)
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
