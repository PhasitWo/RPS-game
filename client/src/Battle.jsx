import { useState, useEffect } from "react";
import "./battle.css";

function Battle({ setPage, socket, roomDetail, setRoomDetail }) {
    // battle
    const [counter, setCounter] = useState(0);
    const [buttonVisible, setButtonVisible] = useState(true);
    const [youScore, setYouScore] = useState(0);
    const [foeScore, setFoeScore] = useState(0);
    const [youWin, setYouWin] = useState(true);
    // rematch modal
    const [rematch, setRematch] = useState(false);
    const [reCounter, setReCounter] = useState(0);

    useEffect(() => {
        socket.on("battle-counter", (number) => setCounter(number));
        socket.on("battle-choose", (callback) => {
            setButtonVisible(true);
            ["R", "P", "S"].forEach((id) => {
                document.getElementById(id).onclick = () => {
                    callback(id);
                    setButtonVisible(false);
                };
            });
        });
        socket.on("battle-score", (score_obj) => {
            // TODO animation
            // setTimeout for animation before set scores
            if (socket.id === score_obj.player1.id) {
                setYouScore(score_obj.player1.score);
                setFoeScore(score_obj.player2.score);
            } else {
                setYouScore(score_obj.player2.score);
                setFoeScore(score_obj.player1.score);
            }
            setButtonVisible(false);
        });
        socket.on("battle-rematch", (winnerId, callback) => {
            if (socket.id === winnerId) setYouWin(true);
            else setYouWin(false);
            document.getElementById("rematch-modal").showModal();
            document.getElementById("rematch-button").onclick = () => {
                callback(true)
                setRematch(true);
            };
        });
        socket.on("battle-rematch-counter", (number) => {
            setReCounter(number)
        })
        socket.on("battle-rematch-confirm", () => {
            // reset state variable
            setYouScore(0);
            setFoeScore(0);
            setRematch(false)
            document.getElementById("rematch-modal").close();
        })
        return () => {
            socket.removeAllListeners("battle-counter");
            socket.removeAllListeners("battle-choose");
            socket.removeAllListeners("battle-score");
            socket.removeAllListeners("battle-rematch");
            socket.removeAllListeners("battle-rematch-counter");
            socket.removeAllListeners("battle-rematch-confirm");
            setRoomDetail(null);
        };
    }, []);

    return (
        <>
            <h3 id="counter">{counter}</h3>
            <div id="score">
                YOU {youScore} vs {foeScore} FOE
            </div>
            <div id="animation-space"></div>
            <div id="button-panel">
                <button style={{ display: !buttonVisible && "none" }} id="R">
                    Rock
                </button>
                <button style={{ display: !buttonVisible && "none" }} id="P">
                    Paper
                </button>
                <button style={{ display: !buttonVisible && "none" }} id="S">
                    Scissors
                </button>
            </div>
            <div id="quit-wrapper">
                <button
                    id="quit"
                    onClick={() => {
                        socket.emit("terminate-room");
                        setPage("Home");
                    }}
                >
                    QUIT
                </button>
            </div>
            <dialog className="rematch-modal" id="rematch-modal">
                {(youWin && "YOU WIN!") || "YOU LOSE :("}
                <br />
                {(!rematch && "Rematch?") || "Waiting for other player.."}
                <br />
                {reCounter}
                <form onSubmit={() => socket.emit("terminate-room")} method="dialog">
                    <button
                        id="rematch-button"
                        type="button"
                        style={{ display: rematch && "none" }}
                    >
                        Rematch
                    </button>
                    <button>Quit</button>
                </form>
            </dialog>
        </>
    );
}

export default Battle;
