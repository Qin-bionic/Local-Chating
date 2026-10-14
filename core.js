//=LIBRARIES==
const { Server } = require('socket.io')
const express = require('express')
const http = require('http')
const path = require('path')
const fs = require('fs')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    pingTimeout: 20000, // timeout 20s
    pingInterval: 25000 // interval(serverloop) 25s
})

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')))

//=READ=WRITE==
const USERS_FILE = path.join(__dirname, 'database', 'users.json')

// fungsi untuk membaca data file JSON
const read = (file) => {
	if (!fs.existsSync(file)) return []
	return JSON.parse(fs.readFileSync(file, 'utf-8'))
}

// fungsi untuk menulis data kedalam file JSON
const write = (file, data) => {
	fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

//=====ROUTES=====
//=Get==
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'saisei.html')
    res.sendFile(filePath)
})

app.get('/Register', (req, res) => {
	const filePath = path.join(__dirname, 'public', 'tensei.html')
	res.sendFile(filePath)
})

app.get('/FairyChat', (req, res) => {
	const filePath = path.join(__dirname, 'public', 'codex.html')
	res.sendFile(filePath)
})

//=Post==
/**
* pos untuk menerima dan mengelola data register
* jika valid dimasukan kedalam database local
* jika proses berhasil langsung beralih ke halaman login
*/
app.post('/tensei', (req, res) => {
	const {username, password} = req.body
	
	if (!username || !password) {
		return res.status(400).json({ error: 'Isi Semua Field!' })
	}
	
	const users = read(USERS_FILE)
	if (users.find(u => u.username === username)) {
		return res.status(400).json({ error: 'Username Sudah Di Pakai!' })
	}
	
	users.push({username, password})
	write(USERS_FILE, users)
	res.json({ status: 'ok' })
})

/**
* pos untuk menerima dan mengelola data login
* jika data login ada didalam file user
* berhasil login dan masuk ke halaman utama
*/
app.post('/saisei', (req, res) => {
	const {username, password} = req.body
	
	if (!username || !password) {
		return res.status(400).json({ error: 'Isi Semua Field!' })
	}
	
	const users = read(USERS_FILE)
	const user = users.find(u => u.username === username && u.password === password)
	
	if (!user) {
		return res.status(401).json({ error: 'Username/Password Salah!' })
	}
	
	res.json({ status: 'ok', username: user.username })
})

//=====MESSAGES=====
const MSG_FILE = path.join(__dirname, 'message', 'chat.json')
const messages = []

try {
	if(fs.existsSync(MSG_FILE)) {
		const msg = JSON.parse(fs.readFileSync(MSG_FILE, 'utf-8')).forEach(i => {messages.push(i)})
		console.log(`[ LOAD ] : Success read file: ${messages.length} messages`)
	}
} catch (err) {
	console.log(`[ LOAD ] : Failed read file ${err}`)
}

//=====SOCKET.IO=====
io.on('connection', (socket) => {
    console.log(`[ CONNECT ] : UID=${socket.id}`)
	// kirim riwayat chat ke clint yang request
	socket.on('request history', () => {
		socket.emit('chat history', messages)
	})

	// terima data dari client, tulis ke data hystory, lalu boardcast
	socket.on('chat message', (data) => {
		const msg = {
			username: data.username,
			message: data.message,
			date: data.date
		}
		messages.push(msg)
		write(MSG_FILE, messages)
		io.emit('chat message', msg)
	})

    socket.on('disconnect', (reason) => {
        console.log(`[ DISCONNECT ] : UID=${socket.id} => ${reason}`)
    })
})

//=====SERVER=RUN=====
server.listen(3000, '0.0.0.0', () => {
    console.log('Server Run on Port: 3000')
})