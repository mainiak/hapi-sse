// Load modules
var Hoek = require('hoek');
var HapiSSE = require('./HapiSSE');
var PassThrough = require('stream').PassThrough;
var util = require('util');

// Declare internals
var internals = {};

// Defaults
internals.defaults = {
    sse: '/sse'
};

// SSE
exports.register = function (plugin, options, next) {

    var hapiSSE = null;
    var settings = Hoek.applyToDefaults(internals.defaults, options || {});

    if (settings.sse) {

        hapiSSE = new HapiSSE();
        plugin.api('channels', hapiSSE)

        plugin.route({
            method: 'GET',
            path: settings.sse,
            handler: function (request) {

                var remoteIP =  request.raw.req.socket.remoteAddress;
                var channel = new PassThrough();

                channel.write(''); // to start reading at any time
                hapiSSE._addUser(remoteIP, channel);

                // detect remote side has closed connection
                request.raw.req.on('close', function() {
                  hapiSSE._delUser(remoteIP);
                });

                request.reply(channel).type('text/event-stream').header('Cache-Control','no-cache').header('Connection','keep-alive');
            },
            config: {
                description: "ServerSideEvent plugin for Hapi.js"
            }
        });
    }

    next();
};
