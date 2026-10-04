const socket = io();

function send() {
	input = document.getElementById("input");
	socket.emit("chat message", input.value);
	input.value = "";
}

socket.on("chat message", (msg) => {
	fetch("/database/message.txt")
		.then(response => response.text())
		.then(data => {
			document.getElementById('text').textContent = data;
		})
		.catch(error => {
			document.getElementById('text').textContent = "Gagal memuat file.";
			console.error('Error:', error);
		});
});
