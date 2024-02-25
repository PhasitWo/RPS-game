import { useState, useEffect, useRef } from "react";
import "./App.css";
import Home from "./Home.jsx";
import Battle from "./Battle.jsx";
import Sound from "./Sound.jsx";
import CustomButton from "./CustomButton.jsx";

function App() {
    const [page, setPage] = useState("Home");
    const [socket, setSocket] = useState(null); // can be 'useRef'
    const [roomDetail, setRoomDetail] = useState(null); // can be 'useRef'
    const [connected, setConnected] = useState(false);
    const autoJoined = useRef(false);

    useEffect(() => {
        let socket = io("https://rps-game-sgv6.onrender.com");
        socket.on("connect", () => {
            setSocket(socket);
            setConnected(true);
            setTimeout(() => {
                // wait 500ms -> fixed socket interpreted as null
                // if there is a url param
                const queryString = window.location.search;
                const param = new URLSearchParams(queryString);
                const code = param.get("code");
                if (code !== null && !autoJoined.current) {
                    autoJoined.current = true;
                    document.getElementById("join-modal").showModal();
                    document.getElementById("code").value = code;
                    document.querySelector("#join-modal button[type=submit]").click();
                }
            }, 500);
        });
        socket.on("room-terminated", () => {
            popError("The room is terminated");
            setPage("Home");
        });
        socket.on("battle-start", (detail) => {
            setPage("Battle");
            setRoomDetail(detail);
        });
        socket.io.on("error", (error) => {
            popError("Unable to establish connection with game server");
            setConnected(false);
            console.log(error);
        });
        // for debug
        // socket.on("server-message", (message) => console.log("[SERVER] " + message));
        // window.onclick = () => {setPage("Battle"); setRoomDetail({player1:"1234", player2: "4321"})}
        return () => socket.close(); // on unmount
    }, []);

    return (
        <>
            <div className="content">
                {page === "Home" && <Home setPage={setPage} socket={socket} connected={connected} />}
                {page === "Battle" && (
                    <Battle setPage={setPage} socket={socket} roomDetail={roomDetail} setRoomDetail={setRoomDetail} />
                )}
            </div>
            <dialog className="error-modal" id="error-modal">
                <p id="error-message">Error</p>
                <form method="dialog">
                    <CustomButton>Close</CustomButton>
                </form>
            </dialog>
            <Sound />
        </>
    );
}

export default App;
