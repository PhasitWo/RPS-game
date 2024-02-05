const socket = io("http://localhost:3000");

var currentRoomCode = null;

function displayMessage(message) {
    const el = document.createElement("li");
    el.innerHTML = message;
    document.querySelector("ul").appendChild(el);
}

socket.on("create-room-status", (status, roomCode) => {
    displayMessage(`you created room -> ${roomCode}`);
    currentRoomCode = roomCode;
});

socket.on("message-receive", (message, id) => {
    if (socket.id === id) message = "*" + message
    displayMessage(message);
});

socket.on("choose", (callback) => {
    document.querySelector("#choose").onclick = () => {
        const text = document.querySelector("input").value;
        callback(text)
        document.querySelector("input").value = "";
    };
})

document.querySelector("#message").onclick = () => {
    const text = document.querySelector("input").value;
    if (text === "") return;
    socket.emit("message-send", text, currentRoomCode);
    document.querySelector("input").value = "";
};

document.querySelector("#create").onclick = () => {
    const text = document.querySelector("input").value;
    socket.emit("create-room");
    document.querySelector("input").value = "";
};

document.querySelector("#join").onclick = () => {
    const text = document.querySelector("input").value;
    socket.emit("join-room", text);
    currentRoomCode = text;
    document.querySelector("input").value = "";
};

document.querySelector("#choose").onclick = () => {
    const text = document.querySelector("input").value;
    socket.emit("choose", text);
    document.querySelector("input").value = "";
};