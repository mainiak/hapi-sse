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

hapiSSE = new HapiSSE();

// SSE
exports.register = function (plugin, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options || {});

    if (settings.sse) {
        plugin.route({
            method: 'GET',
            path: settings.sse,
            handler: function (request) {
                var channel = new PassThrough();
                channel.write(''); // to start reading at any time

                var remoteIP =  request.raw.req.socket.remoteAddress;
                //console.log(util.inspect(remoteIP)); // XXX

                hapiSSE._addUser(remoteIP, channel);

                // detect remote side has closed connection
                request.raw.req.on('close', function() {
                  console.log(remote, arguments); // XXX
                  hapiSSE._delUser(remoteIP);
                });

                hapiSSE.sendMsgTo(remoteIP, 'Welcome!'); // XXX

                request.reply(channel).type('text/event-stream').header('Cache-Control','no-cache').header('Connection','keep-alive');

                // XXX
                setTimeout(function() {
                  hapiSSE.sendMsgTo(remoteIP, 1);
                }, 5000); // 5 secs

                setTimeout(function() {
                  hapiSSE.sendMsgTo(remoteIP, 2);
                }, 10000); // 10 secs

                setTimeout(function() {
                  hapiSSE.sendMsgTo(remoteIP, 3, true);
                  hapiSSE._delUser(remoteIP);
                }, 20000); // 20 secs
                // XXX
            },
            config: {
                description: "ServerSideEvent plugin for Hapi.js"
            }
        });
    }

    next();
};
