var Hapi, hostname, permissions, options, port, server, staticRoute;

Hapi = require('hapi');

hostname = '0.0.0.0';
port = process.env.PORT || 8000;
port = parseInt(port, 10);

server = Hapi.createServer(server, port);

permissions = {};
options = {
  sse: '/sse-events/'
};
server.pack.allow(permissions).require(__dirname + '/..', options, function(err) {
  if (err) {
    console.err("Failed to load plugin.");
    throw err;
  }
});

staticRoute = {
  method: 'GET',
  path: '/{path*}',
  handler: {
    directory: {
      path: __dirname,
      listing: false,
      index: true
    }
  }
};

server.route([staticRoute]);

server.start(function() {
  return console.log("# Started at " + server.info.uri);
});
