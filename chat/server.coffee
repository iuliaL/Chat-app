express = require('express')
app = require('express')()
http = require('http').Server(app)
io = require('socket.io')(http)

app.use '/static', express.static(__dirname + '/public')

app.get '/' , (req, res) ->
	res.sendFile __dirname + '/public/index.html'

nicknames = {}

updateNicknamesOnClient = ->
	io.sockets.emit 'usernames', Object.keys nicknames

io.on 'connection', (socket) ->

	socket.on 'new user', (username, callback) ->
		console.log 'new user', username
#		verify if username can be chosen
		if nicknames[username] then callback({ canUse : false }) #username already in use
		else
			socket.nickname = username
			nicknames[username] = socket
			callback({ canUse: true })
			console.log 'nicknames obj', Object.keys nicknames
			updateNicknamesOnClient()
	
	socket.on 'disconnect', ->
		return unless socket.nickname
		user = socket.nickname
		console.log socket.nickname, ' disconnected'
		delete nicknames[user]
		updateNicknamesOnClient()
		
	socket.on 'send message', (data, callback) ->
		#private message means whispering and the format is '/w Samantha your message...', Samantha being the recipient
		if data.msg.substr(0,3) is '/w ' #that means i should emit to a specific user
			messageFor = data.msg.substring(3)
			spaceIndex = messageFor.indexOf(' ')
			if spaceIndex > -1
				name = messageFor.substring(0,spaceIndex)
				message = messageFor.substring(spaceIndex + 1)
				if nicknames[name] #check if user to emit is online
					nicknames[name].emit 'whisper', { message: message, user: socket.nickname }
					console.log 'whispering'
				else
					console.log 'not a valid user'
					callback('Enter a valid user to whisper to.')
		else #emit to everyone
			console.log 'received message :', data.msg, ' from ', socket.nickname
			io.sockets.emit 'new message', { message: data.msg , user : socket.nickname}


http.listen 8080, ->
	console.log 'listening on *:8080'