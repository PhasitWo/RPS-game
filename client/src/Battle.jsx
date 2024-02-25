import { useState, useEffect, useRef } from "react";
import "./battle.css";
import rockImg from "./assets/rock.png";
import paperImg from "./assets/paper.png";
import scissorsImg from "./assets/scissors.png";
import CustomButton from "./CustomButton.jsx";

const mapping = {
    R: rockImg,
    P: paperImg,
    S: scissorsImg,
    X: null,
};

function Battle({ setPage, socket, roomDetail }) {
    // battle
    const [counter, setCounter] = useState(0);
    const [buttonVisible, setButtonVisible] = useState(false);
    const foeID = useRef();
    const [youScore, setYouScore] = useState(0);
    const [foeScore, setFoeScore] = useState(0);
    const [youImg, setYouImg] = useState(rockImg);
    const [foeImg, setFoeImg] = useState(rockImg);
    const [animate, setAnimate] = useState(false);
    const [youWin, setYouWin] = useState(true);
    // rematch modal
    const [rematch, setRematch] = useState(false);
    const [reCounter, setReCounter] = useState(0);

    useEffect(() => {
        foeID.current = socket.id === roomDetail.player1 ? roomDetail.player2 : roomDetail.player1;
        socket.on("battle-counter", (number) => setCounter(number));
        socket.on("battle-choose", (callback) => {
            setYouImg(rockImg);
            setFoeImg(rockImg);
            setAnimate(false);
            setButtonVisible(true);
            ["R", "P", "S"].forEach((id) => {
                document.getElementById(id).onclick = () => {
                    callback(id);
                    setButtonVisible(false);
                };
            });
        });
        socket.on("battle-score", (result) => {
            // animation
            setAnimate(true);
            setButtonVisible(false);
            // show player choices and scores after animation
            setTimeout(() => {
                setYouImg(mapping[result[socket.id].choice]);
                setFoeImg(mapping[result[foeID.current].choice]);
                setYouScore(result[socket.id].score);
                setFoeScore(result[foeID.current].score);
                if (result.scorerId === socket.id) playSound("you-score-sound")();
                else if (result.scorerId === foeID.current) playSound("foe-score-sound")();
            }, 1500);
        });
        socket.on("battle-rematch", (winnerId, callback) => {
            if (winnerId === socket.id) {
                setYouWin(true);
                playSound("you-win-sound")();
            } else {
                setYouWin(false);
                playSound("you-lose-sound")();
            }
            document.getElementById("rematch-modal").showModal();
            document.getElementById("rematch-button").onclick = () => {
                callback(true);
                setRematch(true);
            };
        });
        socket.on("battle-rematch-counter", (number) => {
            setReCounter(number);
        });
        socket.on("battle-rematch-confirm", () => {
            // reset state variable
            setYouScore(0);
            setFoeScore(0);
            setRematch(false);
            document.getElementById("rematch-modal").close();
        });
        socket.on("battle-reach-max-even", () => {
            setTimeout(() => popError("Reach max even-result times (prevent endless loop)"), 1000);
        });
        return () => {
            socket.removeAllListeners("battle-counter");
            socket.removeAllListeners("battle-choose");
            socket.removeAllListeners("battle-score");
            socket.removeAllListeners("battle-rematch");
            socket.removeAllListeners("battle-rematch-counter");
            socket.removeAllListeners("battle-rematch-confirm");
            socket.removeAllListeners("battle-reach-max-even");
        };
    }, []);

    return (
        <>
            <h3 id="counter">
                <span>BO5</span>
                <br />
                {counter}
            </h3>
            <div id="score">
                <div>YOU {youScore}</div> <div>vs</div> <div>{foeScore} FOE </div>
            </div>
            <div id="animation-space">
                <img id="you-img" className={animate ? "you-animate" : undefined} src={youImg} />
                <img id="foe-img" className={animate ? "foe-animate" : undefined} src={foeImg} />
                {/* cache image */}
                <img src={rockImg} style={{ display: "none", width: "0px", height: "0px" }} />
                <img src={paperImg} style={{ display: "none", width: "0px", height: "0px" }} />
                <img src={scissorsImg} style={{ display: "none", width: "0px", height: "0px" }} />
            </div>
            <div id="button-panel">
                <CustomButton
                    className={!buttonVisible ? "gray-out-button" : undefined}
                    disabled={!buttonVisible}
                    id="R"
                >
                    Rock
                </CustomButton>
                <CustomButton
                    className={!buttonVisible ? "gray-out-button" : undefined}
                    disabled={!buttonVisible}
                    id="P"
                >
                    Paper
                </CustomButton>
                <CustomButton
                    className={!buttonVisible ? "gray-out-button" : undefined}
                    disabled={!buttonVisible}
                    id="S"
                >
                    Scissors
                </CustomButton>
            </div>
            <div id="quit-wrapper">
                <CustomButton
                    id="quit"
                    onClick={() => {
                        socket.emit("terminate-room");
                        setPage("Home");
                    }}
                >
                    QUIT
                </CustomButton>
            </div>
            <dialog className="rematch-modal" id="rematch-modal">
                {(youWin && "YOU WIN!") || "YOU LOSE :("}
                <br />
                {(!rematch && "Rematch?") || "Waiting for other player.."}
                <br />
                {reCounter}
                <form onSubmit={() => socket.emit("terminate-room")} method="dialog">
                    <CustomButton id="rematch-button" type="button" style={{ display: rematch && "none" }}>
                        Rematch
                    </CustomButton>
                    <CustomButton>Quit</CustomButton>
                </form>
            </dialog>
        </>
    );
}

export default Battle;
