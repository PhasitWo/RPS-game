const io = require("socket.io")(3000, { cors: { origin: "*" } });
var crypto = require("crypto");

let rooms = [];

// TODO: event on room-start, event on room-waiting, event on score(play animation)
// TODO: mockup react state change

io.on("connection", (socket) => {
    console.log(`${socket.id} connected to server`);

    socket.on("create-room", (callback) => {
        // create code
        const roomCode = crypto.randomBytes(2).toString("hex");
        rooms.push({ roomCode: roomCode, status: "running", player1: socket.id, player2: null });
        socket.join(roomCode);
        callback(roomCode);
    });

    socket.on("join-room", (roomCode) => {
        let room = rooms.find((obj) => {
            return obj.roomCode === roomCode;
        });
        if (room == undefined) {
            io.to(socket.id).emit("message-receive", "invalid code");
            return;
        }
        if (room.player2 != null) {
            io.to(socket.id).emit("message-receive", "the room is full");
            return;
        }
        if (room.player2 === socket.id || room.player1 === socket.id) {
            io.to(socket.id).emit("message-receive", "you're already in the room!");
            return;
        }
        room.player2 = socket.id;
        socket.join(room.roomCode);
        io.to(room.roomCode).emit("message-receive", `${socket.id} join the room`);
        battle(room);
    });

    socket.on("disconnecting", (reason) => {
        console.log(`${socket.id} disconnecting --> ${reason}`);
        terminateRoom();
    });

    function terminateRoom() {
        // makes all sockets leave room
        Array.from(socket.rooms)
            .slice(1)
            .forEach((roomCode) => {
                io.to(roomCode).emit("room-terminated");
                io.socketsLeave(roomCode);
                console.log(`${roomCode} terminated`)
                // remove room from memory
                let roomIndex = rooms.findIndex((obj) => {
                    return obj.roomCode === roomCode;
                });
                if (roomIndex != -1) {
                    rooms[roomIndex].status = "terminated";
                    rooms.pop(roomIndex);
                }
            });
    }

    async function battle(room) {
        console.log(`${room.roomCode} START!`);
        let p1Score = 0;
        let p2Score = 0;
        let p1Choice = null;
        let p2Choice = null;
        let evenCnt = 0;
        const maxEvenCnt = 3;
        while (p1Score < 3 && p2Score < 3) {
            console.log(room.status);
            if (room.status === "terminated") return;
            // counter
            let cnt = 4;
            let counter = setInterval(() => {
                io.to(room.roomCode).emit("message-receive", cnt--);
            }, 1000);
            // ask players to choose
            io.to(room.roomCode).emit("message-receive", `wait for player choices`);
            let p1Promise = new Promise((resolve, reject) => {
                io.to(room.player1)
                    .timeout(5000)
                    .emit("choose", (err, response) => {
                        if (err) resolve("X");
                        else resolve(response);
                    });
            });
            let p2Promise = new Promise((resolve, reject) => {
                io.to(room.player2)
                    .timeout(5000)
                    .emit("choose", (err, response) => {
                        if (err) resolve("X");
                        else resolve(response);
                    });
            });
            [[p1Choice], [p2Choice]] = await Promise.all([p1Promise, p2Promise]); // parallel ongoing promises
            clearInterval(counter);
            io.to(room.roomCode).emit("message-receive", `p1Choice:${p1Choice}  p2Choice:${p2Choice}`);
            // evaluate
            let result;
            if (p1Choice === "X" && p2Choice === "X") result = 0;
            else if (
                (p1Choice === "R" && p2Choice === "S") ||
                (p1Choice === "S" && p2Choice === "P") ||
                (p1Choice === "P" && p2Choice === "R") ||
                (p1Choice !== "X" && p2Choice === "X")
            ) {
                result = 1;
                p1Score++;
            } else {
                result = 2;
                p2Score++;
            }
            // score
            if (result === 0) {
                io.to(room.roomCode).emit("message-receive", `EVEN!`);
                evenCnt++;
                if (evenCnt == maxEvenCnt) {
                    io.to(room.roomCode).emit("message-receive", `REACH MAX 'EVEN' COUNT`);
                    terminateRoom()
                    return;
                }
            } else io.to(room.roomCode).emit("message-receive", `Player${result} Score!`);
            io.to(room.roomCode).emit("message-receive", `Player1 - ${p1Score} VS ${p2Score} - Player2`);
            p1Choice = null;
            p2Choice = null;
        }
        // anouce winner
        let winner = (p1Score === 3 && "player1") || (p2Score === 3 && "player2");
        io.to(room.roomCode).emit("message-receive", `${winner} win!!!`);
        // ask replay
        io.to(room.roomCode).emit("message-receive", `Replay: y/n`);
        // counter
        let cnt = 9;
        let counter = setInterval(() => {
            io.to(room.roomCode).emit("message-receive", cnt--);
        }, 1000);
        // ask players
        let p1Promise = new Promise((resolve, reject) => {
            io.to(room.player1)
                .timeout(10000)
                .emit("choose", (err, response) => {
                    if (err) resolve("X");
                    else resolve(response);
                });
        });
        let p2Promise = new Promise((resolve, reject) => {
            io.to(room.player2)
                .timeout(10000)
                .emit("choose", (err, response) => {
                    if (err) resolve("X");
                    else resolve(response);
                });
        });
        [[p1Choice], [p2Choice]] = await Promise.all([p1Promise, p2Promise]); // parallel ongoing promises
        clearInterval(counter);
        // evaluate
        if (p1Choice === "y" && p2Choice === "y") battle(room);
        else terminateRoom();
    }
});
