// Load modules
var Hoek = require('hoek');

// Declare internals
var internals = {};

// Defaults
internals.defaults = {
    sse: '/sse'
};

// SSE
exports.register = function (plugin, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options || {});

    if (settings.sse) {
        plugin.route({
            method: 'GET',
            path: settings.sse,
            handler: function () {
                this.reply('data: "Hello SSE World!!!"').type('text/event-stream').header('Cache-Control','no-cache').header('Connection','keep-alive');
                /* // FIXME - this doesn't work (closing request with line above?)
                var request = this;
                var t = setInterval(function() {
                  console.log('Send data');
                  request.reply("data: DATA\n\n").type('text/event-stream').header('Cache-Control','no-cache').header('Connection','keep-alive');
                }, 1000);
                */
            },
            config: {
                description: "ServerSideEvent plugin for Hapi.js"
            }
        });
    }

    next();
};
