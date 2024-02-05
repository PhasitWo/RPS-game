const socket = io("http://localhost:3000");

var currentRoomCode = null;

function displayMessage(message) {
    const div = document.createElement("div")
    const container = document.getElementById("message-container");
    div.textContent = message
    container.append(div)
    container.scrollTop = container.scrollHeight;
}

socket.on("room-terminated", () => {
    displayMessage(`you leave room -> ${currentRoomCode}`);
    currentRoomCode = null;
});

socket.on("message-receive", (message, id) => {
    if (socket.id === id) message = "*" + message;
    displayMessage(message);
});

socket.on("choose", (callback) => {
    document.querySelector("#choose").onclick = () => {
        const text = document.querySelector("input").value;
        callback(text);
        document.querySelector("input").value = "";
    };
});


document.querySelector("#create").onclick = () => {
    const text = document.querySelector("input").value;
    document.querySelector("input").value = "";
    socket.emit("create-room", (response) => {
        currentRoomCode = response;
        displayMessage(`you created room -> ${currentRoomCode}`);
    });
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
