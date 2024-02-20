import { useState, useEffect } from "react";
import "./battle.css"
// TODO animation
function Battle({ setPage, socket, roomDetail, setRoomDetail }) {
    const [counter, setCounter] = useState(0);
    const [buttonVisible, setButtonVisible] = useState(true);
    const [youScore, setYouScore] = useState(0)
    const [foeScore, setFoeScore] = useState(0)

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
            if (socket.id === score_obj.player1.id) {
                setYouScore(score_obj.player1.score);
                setFoeScore(score_obj.player2.score);
            } else {
                setYouScore(score_obj.player2.score);
                setFoeScore(score_obj.player1.score);
            }
            setButtonVisible(false)
        })
        return () => {
            socket.removeAllListeners("battle-counter");
            socket.removeAllListeners("battle-choose");
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
        </>
    );
}

export default Battle;
