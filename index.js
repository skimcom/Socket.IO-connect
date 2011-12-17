var io = require('socket.io');

exports.prefix = function(io, callback) {
  if (!io || !callback) {
    throw new Error('wrong arguments');
  }

  return function(socket) {
    var dummyRes;

    dummyRes = {
      writeHead: null,
      setHeader: function() {},
      url: ''
    };

    // Throw the request down the Connect middleware stack
    // so we can use Connect middleware for free.
    io.server.handle(socket.request, dummyRes, function() {
      callback(socket, socket.request, socket.request.res);
    });
  };
};

exports.connect = function(server, options, callback) {
  var connected = false;

  if (typeof options === 'function') {
    callback = options;
    options = null;
  }

  if (!server || !callback) {
    throw new Error('wrong arguments');
  }

  return function (req, res, next) {
    if (!connected) {
      // function can be used to access server later
      if (typeof server === 'function') {
        server = server();
      }

      io = io.listen(server, options);
      io.on('connection', exports.prefix(io, callback));
      connected = true;
    }
    next();
  };
};
