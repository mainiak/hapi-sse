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

var channel = new Readable();
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

var i = 0;
var t = setInterval(function() {
  console.log('Sending: ' + i);
  channel.push('data: ' + i.toString() + "\n\n");
  //channel.read(); // this closes connection immediately
  i++;
}, 5000); // 5 secs
// XXX

// SSE
exports.register = function (plugin, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options || {});

    if (settings.sse) {
        plugin.route({
            method: 'GET',
            path: settings.sse,
            handler: function (request) {
                var remote =  request.raw.req.socket.remoteAddress;
                //console.log(util.inspect(remote)); // XXX

                sseEmitter.emit('open', remote);

                // detect remote side has closed connection
                request.raw.req.on('close', function() {
                  sseEmitter.emit('close', remote);
                });

                /* // XXX - it doesn't work with this
                // http://nodejs.org/api/http.html#http_request_setsocketkeepalive_enable_initialdelay
                request.raw.req.socket.setKeepAlive(true);
                */ // XXX

                request.reply(channel).type('text/event-stream').header('Cache-Control','no-cache').header('Connection','keep-alive');
            },
            config: {
                description: "ServerSideEvent plugin for Hapi.js"
            }
        });
    }

    next();
};
