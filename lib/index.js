// Load modules
var Hoek = require('hoek');

// Declare internals
var internals = {};

// Defaults
internals.defaults = {
    sse: '/sse'
};

// source: http://nodejs.org/api/stream.html#stream_example_a_counting_stream
var Readable = require('stream').Readable;
var util = require('util');
util.inherits(Counter, Readable);

function Counter(opt) {
  Readable.call(this, opt);
  this._max = 1000000;
  this._index = 1;
}

Counter.prototype._read = function() {
  var i = this._index++;
  if (i > this._max)
    this.push(null);
  else {
    var str = 'data: ' + i + "\n\n"; // SSE modification
    var buf = new Buffer(str, 'ascii');
    this.push(buf);
  }
};

var counterStream = new Counter();
// TODO: emit in intervals - not on read
// see also http://blog.strongloop.com/practical-examples-of-the-new-node-js-streams-api/

var EventEmitter = require('events').EventEmitter;
var sseEmitter = new EventEmitter();

// XXX
sseEmitter.on('open', function(remote) {
    console.log('new: ' + remote);
});

sseEmitter.on('close', function(remote) {
    console.log('closing: ' + remote);
});

var t = setInterval(function() {
  console.log('Send data');
  counterStream.read(); // XXX
}, 2000);
// XXX

// SSE
exports.register = function (plugin, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options || {});

    if (settings.sse) {
        plugin.route({
            method: 'GET',
            path: settings.sse,
            handler: function () {
                sseEmitter.emit('open', this.request.raw.req.remoteAddress);

                // detect remote side has closed connection
                this.request.raw.req.on('close', function() {
                  sseEmitter.emit('close', this.request.raw.req.remoteAddress);
                });

                // http://nodejs.org/api/http.html#http_request_setsocketkeepalive_enable_initialdelay
                this.request.raw.req.setSocketKeepAlive(true); // TODO: needed?

                this.reply(counterStream).type('text/event-stream').header('Cache-Control','no-cache').header('Connection','keep-alive');
            },
            config: {
                description: "ServerSideEvent plugin for Hapi.js"
            }
        });
    }

    next();
};
