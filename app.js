
/**
 * Module dependencies.
 */

var sys = require('util')
  , express = require('express')
  , sio = require('socket.io')
  , routes = require('./routes');

var app = module.exports = express.createServer();

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: '11541715851233279995' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);

var io = sio.listen(app)
	, nicknames = [];

io.sockets.on('connection', function (socket) {
	
	socket.on('user message', function (msg) {
		socket.broadcast.emit('user message', socket.nickname, msg, new Date());
	});

	socket.on('nickname', function (nick, fn) {
		if (nicknames.indexOf(nick) < 0) {
			socket.nickname = nick;
			nicknames.push(nick);
			socket.broadcast.emit('announcement', nick + ' connected');
			io.sockets.emit('nicknames', nicknames);
			fn(false);
		} else {
			fn(true);
		}
	});

	socket.on('disconnect', function () {
		if (!socket.nickname) return;
		for(var i = 0; i < nicknames.length; i++) {
			if(nicknames[i] == socket.nickname) {
				delete nicknames[i];
			}
		}
		socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
		socket.broadcast.emit('nicknames', nicknames);
	});
});
