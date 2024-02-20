import { useState, useEffect } from "react";

function Battle({ setPage, socket, roomDetail, setRoomDetail }) {
    const [counter, setCounter] = useState(0);
    const [buttonVisible, setButtonVisible] = useState(false);

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
            <h1>This is Battle! Page</h1>
            <h2>{counter}</h2>
            <p>{JSON.stringify(roomDetail)}</p>
            <p>
                <button style={{ display: !buttonVisible && "none" }} id="R">
                    Rock
                </button>
                <button style={{ display: !buttonVisible && "none" }} id="P">
                    Paper
                </button>
                <button style={{ display: !buttonVisible && "none" }} id="S">
                    Scissors
                </button>
            </p>
            <button
                onClick={() => {
                    socket.emit("terminate-room");
                    setPage("Home");
                }}
            >
                QUIT
            </button>
        </>
    );
}

export default Battle;
