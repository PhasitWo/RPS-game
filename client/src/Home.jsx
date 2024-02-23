import { useState } from "react";

function Home({ setPage, socket, connected }) {
    const [roomCode, setRoomCode] = useState(null);

    function createRoom() {
        socket.emit("create-room", (roomCode) => {
            setRoomCode(roomCode);
            const waitModal = document.getElementById("create-modal");
            waitModal.showModal();
        });
    }

    function copyCodeToClipboard() {
        navigator.clipboard.writeText(roomCode);
        alert(`"${roomCode}" is copied to your clipboard`);
    }

    function copyLinkToClipboard() {
        const url = window.location.origin + "/?code=" + roomCode;
        navigator.clipboard.writeText(url);
        alert(`"${url}" is copied to your clipboard`);
    }
    // no need anymore as we have copy-link function
    // async function pasteFromClipboard() {
    //     const codeField = document.getElementById("code");
    //     let clipboardText = await navigator.clipboard.readText();
    //     if (codeField.value != "" || clipboardText.length !== 4) return;
    //     codeField.value = clipboardText;
    // }

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
                <button onClick={createRoom} onMouseDown={playSound("click-sound")}>
                    Create Room
                </button>
                <br />
                <button
                    onClick={() => document.getElementById("join-modal").showModal()}
                    onMouseDown={playSound("click-sound")}
                >
                    Join Room
                </button>
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
                            // onFocus={pasteFromClipboard}
                            autoComplete="off"
                            required
                        ></input>
                        <button type="submit" autoFocus onMouseDown={playSound("click-sound")}>
                            Join
                        </button>
                        <button
                            type="button"
                            onClick={() => document.getElementById("join-modal").close()}
                            onMouseDown={playSound("click-sound")}
                        >
                            Close
                        </button>
                    </form>
                </dialog>
                <dialog className="create-modal" id="create-modal">
                    Waiting for other player!
                    <br />
                    Send this <i>{roomCode}</i> to your friend
                    <form onSubmit={() => socket.emit("terminate-room")} method="dialog">
                        <button
                            id="copy-code-button"
                            type="button"
                            onClick={copyCodeToClipboard}
                            onMouseDown={playSound("click-sound")}
                        >
                            Copy Code
                        </button>
                        <button
                            id="copy-link-button"
                            type="button"
                            onClick={copyLinkToClipboard}
                            onMouseDown={playSound("click-sound")}
                        >
                            Copy Link
                        </button>
                        <button onMouseDown={playSound("click-sound")}>Quit</button>
                    </form>
                </dialog>
            </div>
            <div id="status-container">
                <h4 id="status">{(connected && "connected") || "NOT CONNECT TO SERVER"}</h4>
                <a href="https://github.com/PhasitWo/RPS-game" target="blank">
                    <i className="fa fa-github"></i> github.com/PhasitWo/RPS-game
                </a>
            </div>
        </>
    );
}

export default Home;
