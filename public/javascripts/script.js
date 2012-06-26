!function($, w) {
	
	var chat;
	
	var messageModel = function(data) {
		$.extend(this, {
			name: data.name || '',
			message: data.message,
			date: data.date || new Date()
		});
	};
	
	var chatModel = function() {
		var self = this;
		$.extend(this, {
			name: ko.observable(),
			members: ko.observableArray(),
			messages: ko.observableArray(),
			add: function (data) {
				self.messages.unshift(new messageModel(data));
			}
		});
	};
	
	
	var socket = w.io.connect();
	
	socket.on('connect', function () {
		$('#connecting').show();
	});

	socket.on('announcement', function (msg) {
		chat.add({message: msg});
	});

	socket.on('nicknames', function (nicknames) {
		chat.members(nicknames);
	});

	socket.on('user message', message);
	
	socket.on('reconnect', function () {
		message('System', 'Reconnected to the server');
	});
	socket.on('reconnecting', function () {
		message('System', 'Attempting to re-connect to the server');
	});
	socket.on('error', function (e) {
		message('System', e ? e : 'A unknown error occurred');
	});

	function message (from, msg, date) {
		chat.add({
			name: from,
			message: msg,
			date: date
		});
		// $('#lines').append($('<p>').prepend($('<b>').text(from), msg));
	}

	// dom manipulation
	$(function () {
		
		chat = new chatModel;
		 ko.applyBindings(chat, $('#chat').get(0));
		
		$('#set-nickname').submit(function (e) {
			e.preventDefault();
			var nick = $('#nick').val();
			if(nick == '') return;
			socket.emit('nickname', nick, function (set) {
				if (!set) {
					chat.name(nick);
					$('#set-nickname').hide();
					$('#messageArea').show();
					clear();
					return;
				}
				$('#set-nickname .control-group').addClass('error').find('.help-inline').show();
				
			});
		});

		$('#send-message').submit(function (e) {
			e.preventDefault();
			if($('#message').val() == '') return;
			socket.emit('user message', $('#message').val());
			message('me', $('#message').val(), new Date());
			clear();
		});

		function clear () {
			$('#message').val('').focus();
		};
	});

	}(jQuery, window);