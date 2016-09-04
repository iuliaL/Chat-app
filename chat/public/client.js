var socket = io('/');

var $document = $(document),
	$nicknameForm =  $('#nicknameForm'),
	$usernameInput = $('#username'),
	$chatBox =  $('#chatBox'),
	$users =  $('#users'),
	$m = $('#m'),
	$error = $('.error'),
	$messages = $('#messages');
	
// this is emitting the new user nickname from the client
$document.ready(function () {
	$usernameInput.trigger('focus');
	$nicknameForm.submit(function(){
		socket.emit('new user', $usernameInput.val(), function (data) {
			if (data.canUse) {
				console.log('this nickname was checked by the server and can be used');
				$nicknameForm.fadeOut();
				$chatBox.fadeTo( 'fast', 1 );
				$m.trigger('focus');
				$error.slideUp();
			} else { $error.text('This nickname is already in use.').slideDown().delay(4000).slideUp();}
		});
		$m.val('');
		return false;
	});
	
// this is displaying the current users (and does that any time a new user joins)
	socket.on('usernames', function (nicknames) {
		$users.html(''); // clear the list before repopulating it
		usersList = '<ul>';
		console.log('nicks',nicknames);
		nicknames.forEach(function(nick){
			usersList += '<li>'+ nick +'</li>'
		});
		usersList += '</ul>';
		$users.append(usersList);
	});
	
// this is sending a new message to everyone
	$chatBox.submit(function() {
		console.log ('message submitted');
		messageData = { msg:  $m.val().trim()};
		socket.emit("send message", messageData, function (error) {
			$error.text(error).slideDown().delay(4000).slideUp();
		});
		$m.val('');
		return false;
	});

// receiving
	
	socket.on("new message", function(messageFrom) {
		console.log('this is data from server',messageFrom);
		$messages.append('<li class="bubble"><strong class="nickname">'+ messageFrom.user +'</strong><p class="message">'+ messageFrom.message +'</p></li>');
	});
	// receiving a whisper (kinda like a private message)
	socket.on("whisper", function(messageFrom) {
		console.log('this is a whisper',messageFrom);
		$messages.append('<li class="bubble whisper"><strong class="nickname">'+ messageFrom.user +'&nbsp; <small>whispers</small></strong><p class="message"><i>'+ messageFrom.message +'</i></p></li>');
	});
	
}); // end doc.ready

