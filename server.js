const { Server } = require('socket.io');
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use('/database', express.static(path.join(__dirname, 'database')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	const filePath = path.join(__dirname,'public', 'index.html');
	res.sendFile(filePath);
});

io.on('connection', (socket) => {
	console.log('Ada tamu');
	socket.on('chat message', (msg) => {
		const time = new Date().toLocaleTimeString(undefined, {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
		const file = path.join(__dirname, 'database', 'message.txt');
		fs.appendFile(file, `[${time}] `+msg+'\n', 'utf-8', (err) => {
			if (err) {
				console.log('gagal menulis file:', err);
				return;
			}
			console.log('berhasil!')
		});
		io.emit('chat message', msg);
	});
});

server.listen(3000, '0.0.0.0', () => {
	console.log('Server jalan di port 3000')
});

