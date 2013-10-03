var Hapi, hostname, permissions, options, port, server, staticRoute, handler;

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

server.route({
  method: 'GET',
  path: '/{path*}',
  handler: {
    directory: {
      path: __dirname,
      listing: false,
      index: true
    }
  }
});

server.start(function() {
  return console.log("# Started at " + server.info.uri);
});

var handler = {
  num: 0,
  hapiSSE: server.plugins['hapi-sse']['channels']
};

function hailUsers() {
  var users = this.hapiSSE._users;
  var count = 0;
  for (user in users) {
    //console.log(user); // XXX
    //console.log(users[user]); // XXX
    //users[user].write('data: ' + this.num + "\n\n"); // XXX
    this.hapiSSE.sendMsgTo(user, this.num);
    count++;
  }
  console.log('i: ' + this.num + ', users: ' + count); // XXX
  this.num++;
}

// every 10 secs
setInterval(hailUsers.bind(handler), 10000);
