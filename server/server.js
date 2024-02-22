const io = require("socket.io")(3000, { cors: { origin: "*" } });
var crypto = require("crypto");

let rooms = [];

io.on("connection", (socket) => {
    console.log(`${socket.id} connected to server`);
    // TODO: battle-rematch event
    socket.on("create-room", (callback) => {
        // create code
        const roomCode = crypto.randomBytes(2).toString("hex");
        rooms.push({ roomCode: roomCode, status: "running", player1: socket.id, player2: null });
        socket.join(roomCode);
        callback(roomCode);
        console.log(`room ${roomCode} created`);
        // TODO: waiting-for-player timeout
    });

    socket.on("terminate-room", () => {
        terminateRoom();
    });

    socket.on("join-room", (roomCode, callback) => {
        let room = rooms.find((obj) => {
            return obj.roomCode === roomCode;
        });
        if (room == undefined) {
            callback("invalid code");
            return;
        }
        if (room.player2 != null) {
            callback("the room is full");
            return;
        }
        if (room.player2 === socket.id || room.player1 === socket.id) {
            callback("you're already in the room!");
            return;
        }
        room.player2 = socket.id;
        socket.join(room.roomCode);
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
                console.log(`room ${roomCode} terminated`);
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
        io.to(room.roomCode).emit("battle-start", room);
        console.log(`${room.roomCode} START!`);
        let p1Score = 0;
        let p2Score = 0;
        let p1Choice = null;
        let p2Choice = null;
        let evenCnt = 0;
        const maxChooseTime = 10;
        const maxEvenCnt = 3;
        while (p1Score < 3 && p2Score < 3) {
            if (room.status === "terminated") return;
            // counter
            let cnt = maxChooseTime;
            io.to(room.roomCode).emit("battle-counter", cnt--);
            let counter = setInterval(() => {
                io.to(room.roomCode).emit("battle-counter", cnt--);
            }, 1000);
            // ask players to choose
            io.to(room.roomCode).emit("server-message", `wait for player choices`);
            let p1Promise = new Promise((resolve, reject) => {
                io.to(room.player1)
                    .timeout(maxChooseTime * 1000)
                    .emit("battle-choose", (err, response) => {
                        if (err) resolve("X");
                        else resolve(response);
                    });
            });
            let p2Promise = new Promise((resolve, reject) => {
                io.to(room.player2)
                    .timeout(maxChooseTime * 1000)
                    .emit("battle-choose", (err, response) => {
                        if (err) resolve("X");
                        else resolve(response);
                    });
            });
            [[p1Choice], [p2Choice]] = await Promise.all([p1Promise, p2Promise]); // parallel ongoing promises
            clearInterval(counter);
            io.to(room.roomCode).emit("server-message", `p1Choice:${p1Choice}  p2Choice:${p2Choice}`);
            // evaluate
            let result;
            if (p1Choice === "X" && p2Choice === "X" || p1Choice === p2Choice) result = 0;
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
                io.to(room.roomCode).emit("server-message", `EVEN!`);
                evenCnt++;
                if (evenCnt == maxEvenCnt) {
                    io.to(room.roomCode).emit("server-message", `REACH MAX 'EVEN' COUNT`);
                    io.to(room.roomCode).emit("battle-reach-max-even");
                    terminateRoom();
                    return;
                }
            } else io.to(room.roomCode).emit("server-message", `Player${result} Score!`);
            io.to(room.roomCode).emit("server-message", `Player1 - ${p1Score} VS ${p2Score} - Player2`);
            // play animation
            io.to(room.roomCode).emit("battle-score", {
                [room.player1]: { choice: p1Choice, score: p1Score },
                [room.player2]: { choice: p2Choice, score: p2Score },
            });
            io.to(room.roomCode).emit("server-message", `start animation`);
            await new Promise((resolve) => setTimeout(resolve, 4000));
            io.to(room.roomCode).emit("server-message", `animation ended`);
            // reset choice
            p1Choice = null;
            p2Choice = null;
        }
        // anouce winner
        let winner = (p1Score === 3 && "player1") || (p2Score === 3 && "player2");
        io.to(room.roomCode).emit("server-message", `${winner} win!!!`);
        // ask rematch
        // counter
        const maxAskRematchTime = 10;
        let cnt = maxAskRematchTime;
        io.to(room.roomCode).emit("battle-rematch-counter", cnt--);
        let counter = setInterval(() => {
            io.to(room.roomCode).emit("battle-rematch-counter", cnt--);
        }, 1000);
        // ask players
        let p1Promise = new Promise((resolve, reject) => {
            io.to(room.player1)
                .timeout(maxAskRematchTime * 1000)
                .emit("battle-rematch", room[winner], (err, response) => {
                    if (err) resolve(false);
                    else resolve(response);
                });
        });
        let p2Promise = new Promise((resolve, reject) => {
            io.to(room.player2)
                .timeout(maxAskRematchTime * 1000)
                .emit("battle-rematch", room[winner], (err, response) => {
                    if (err) resolve(false);
                    else resolve(response);
                });
        });
        [p1Choice, p2Choice] = await Promise.all([p1Promise, p2Promise]); // parallel ongoing promises
        clearInterval(counter);
        // evaluate
        if (p1Choice && p2Choice) {
            io.to(room.roomCode).emit("battle-rematch-confirm");
            battle(room);
        } else terminateRoom();
    }
});
