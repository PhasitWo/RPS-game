import { useState } from "react";
import CustomButton from "./CustomButton.jsx";

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
                <CustomButton onClick={createRoom}>Create Room</CustomButton>
                <br />
                <CustomButton onClick={() => document.getElementById("join-modal").showModal()}>Join Room</CustomButton>
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
                        <CustomButton type="submit" autoFocus>
                            Join
                        </CustomButton>
                        <CustomButton type="button" onClick={() => document.getElementById("join-modal").close()}>
                            Close
                        </CustomButton>
                    </form>
                </dialog>
                <dialog className="create-modal" id="create-modal">
                    Waiting for other player!
                    <br />
                    Send this <i>{roomCode}</i> to your friend
                    <form onSubmit={() => socket.emit("terminate-room")} method="dialog">
                        <CustomButton id="copy-code-button" type="button" onClick={copyCodeToClipboard}>
                            Copy Code
                        </CustomButton>
                        <CustomButton id="copy-link-button" type="button" onClick={copyLinkToClipboard}>
                            Copy Link
                        </CustomButton>
                        <CustomButton autoFocus>Quit</CustomButton>
                    </form>
                </dialog>
            </div>
            <div id="status-container">
                <h5 id="status">{(connected && "connected") || "Connecting to game server..."}</h5>
                <a href="https://github.com/PhasitWo/RPS-game" target="blank">
                    <i className="fa fa-github"></i> github.com/PhasitWo/RPS-game
                </a>
            </div>
        </>
    );
}

export default Home;
