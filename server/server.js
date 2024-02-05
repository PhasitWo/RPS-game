const io = require("socket.io")(3000, { cors: { origin: "*" } });
var crypto = require("crypto");

let rooms = [];

io.on("connection", (socket) => {
    console.log(`${socket.id} connected to server`);

    let battle = async (room) => {
        console.log(`${room.roomCode} START!`);
        let p1Score = 0;
        let p2Score = 0;
        let p1Choice = null;
        let p2Choice = null;
        while (p1Score < 3 && p2Score < 3) {
            io.to(room.roomCode).emit("message-receive", `wait for player choices`);
            // counter
            let cnt = 9;
            let counter = setInterval(() => {
                io.to(room.roomCode).emit("message-receive", cnt--);
            }, 1000);
            // ask players to choose
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
            io.to(room.roomCode).emit("message-receive", `p1Choice:${p1Choice}  p2Choice:${p2Choice}`);
            // evaluate
            let result;
            if (p1Choice === 'X' && p2Choice === 'X') result = 0;
            else if (
                (p1Choice === 'R' && p2Choice === 'S') ||
                (p1Choice === 'S' && p2Choice === 'P') ||
                (p1Choice === 'P' && p2Choice === 'R') ||
                (p1Choice !== 'X' && p2Choice === 'X')
            )
                {result = 1; p1Score++}
            else {result = 2; p2Score++}
            // score
            if (result === 0) io.to(room.roomCode).emit("message-receive", `EVEN!`);
            else io.to(room.roomCode).emit("message-receive", `Player${result} Score!`);
            p1Choice = null;
            p2Choice = null;
        }
        let winner = (p1Score === 3 && "player1") || (p2Score === 3 && "player2")
        io.to(room.roomCode).emit("message-receive", `${winner} win!!!`);
    };

    socket.on("create-room", () => {
        // create code
        const roomCode = crypto.randomBytes(2).toString("hex");
        rooms.push({ roomCode: roomCode, player1: socket.id, player2: null });
        socket.join(roomCode);
        io.to(socket.id).emit("create-room-status", "ready", roomCode);
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

});

