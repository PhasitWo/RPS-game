import { useState, useEffect } from "react";
import "./App.css";
import Home from "./Home.jsx";
import Battle from "./Battle.jsx";

function App() {
    const [page, setPage] = useState("Home");
    const [socket, setSocket] = useState(null); // can be 'useRef'
    const [roomDetail, setRoomDetail] = useState(null); // can be 'useRef'
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        let socket = io("https://rps-game-sgv6.onrender.com");
        socket.on("connect", () => {
            setSocket(socket);
            setConnected(true);
        });
        socket.on("room-terminated", () => {
            popError("The room is terminated");
            setPage("Home");
        });
        socket.on("battle-start", (detail) => {
            setPage("Battle");
            setRoomDetail(detail);
        });
        socket.on("server-message", (message) => console.log("[SERVER] " + message));
        socket.io.on("error", (error) => {
            popError("Cannot Connect to Server");
            setConnected(false);
            console.log(error);
        });

        return () => socket.close(); // on unmount
    }, []);

    return (
        <>
            {/* <div className="navbar">
                <button onClick={() => setPage("Home")}>Home</button>
                <button onClick={() => setPage("Battle")}>Battle</button>
            </div> */}
            <div className="content">
                {page === "Home" && <Home setPage={setPage} socket={socket} connected={connected} />}
                {page === "Battle" && (
                    <Battle setPage={setPage} socket={socket} roomDetail={roomDetail} setRoomDetail={setRoomDetail} />
                )}
            </div>
            <dialog className="error-modal" id="error-modal">
                <p id="error-message">Error</p>
                <form method="dialog">
                    <button>Close</button>
                </form>
            </dialog>
        </>
    );
}

export default App;
