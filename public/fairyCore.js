const username = localStorage.getItem('username')
if (!username) {
	alert('Kamu belum login! Silahkan login')
	window.location.href = '/'
	throw new Error('Belum login!')
}

//status load chat
const loadedChat = false
// inisiasi socket
const socket = io()

// fungsi kirim pesan
const send = () => {
    const message = document.getElementById('input').value
	const date = new  Date(Date.now()).toLocaleTimeString(undefined, {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	})
	const chat = {
		username,
		message,
		date
	}
	socket.emit('chat message', chat)
	document.getElementById('input').value = ''
}

// fungsi tambah chat ke interface
const appendChat = (username, message, date, type) => {
	const chatContainer = document.querySelector('.chat-container')

	const newChat = document.createElement('li')
	newChat.className = `message ${type}`
	newChat.innerHTML = `
		<span class="user-name">${username}</span>
			<div class="chat">
				<span class="message">${message}</span>
				<span class="date">${date}</span>
			</div>
	`

	chatContainer.appendChild(newChat)
}

// hystory untuk client yang baru connect
socket.on('connect', () => {
	if (!loadedChat) {
		socket.emit('request history')
	}
})
socket.on('chat history', (data) => {
	data.forEach(obj => {
		if (obj.username === username) {
			appendChat(obj.username, obj.message, obj.date, 'sender')
		} else {
			appendChat(obj.username, obj.message, obj.date, 'receiver')
		}
	})
})

// even ketika ada pesan baru
socket.on('chat message', (data) => {
	if (data.username === username) {
		appendChat(data.username, data.message, data.date, 'sender')
	} else {
		appendChat(data.username, data.message, data.date, 'receiver')
	}
})