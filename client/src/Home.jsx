import { useState } from "react";

function Home({ setPage, socket }) {
    const [roomCode, setRoomCode] = useState(null);

    function createRoom() {
        socket.emit("create-room", (roomCode) => {
            setRoomCode(roomCode);
            const waitModal = document.getElementById("wait-modal");
            waitModal.showModal();
        });
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(roomCode);
    }

    async function pasteFromClipboard() {
        const codeField = document.getElementById("code");
        let clipboardText = await navigator.clipboard.readText();
        if (codeField.value != "" || clipboardText.length !== 4) return;
        codeField.value = clipboardText;
    }

    function joinRoom(e) {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        socket.emit("join-room", data.get("code").trim(), (err_res) => {
            popError(err_res);
        });
    }

    return (
        <>
            <div className="home-container">
                <h2>Rock Paper Scissors</h2>
                <button onClick={createRoom}>Create Room</button>
                <br />
                <button onClick={() => document.getElementById("join-modal").showModal()}>Join Room</button>
                <dialog
                    className="join-modal"
                    id="join-modal"
                    onClose={(e) => (document.querySelector("#code").value = "")}
                >
                    Join Your Friend!
                    <form onSubmit={joinRoom} method="dialog">
                        
                        <input
                            id="code"
                            name="code"
                            placeholder="code"
                            onFocus={pasteFromClipboard}
                            autoComplete="off"
                            required
                        ></input>
                        <button type="submit" autoFocus>
                            Join
                        </button>
                        <button type="button" onClick={() => document.getElementById("join-modal").close()}>
                            Close
                        </button>
                    </form>
                </dialog>
                <dialog className="wait-modal" id="wait-modal">
                    Waiting for other player!
                    <br />
                    Send this   <i>{roomCode}</i>   to your friend
                    <form onSubmit={() => socket.emit("terminate-room")} method="dialog">
                        <button id="copy-button" type="button" onClick={copyToClipboard}>
                            Copy
                        </button>
                        <button autoFocus>Quit</button>
                    </form>
                </dialog>
            </div>
            <div id="status-container">
                <h4 id="status">{(socket !== null && socket.connected && "connected") || "NOT CONNECT TO SERVER"}</h4>

                <a href="https://github.com/PhasitWo/RPS-game" target="blank">
                    <i class="fa fa-github"></i> github.com/PhasitWo/RPS-game
                </a>
            </div>
        </>
    );
}

export default Home;
