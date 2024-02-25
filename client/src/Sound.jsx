import clickSound from "./assets/button-click.wav";
import youScoreSound from "./assets/you-score.wav";
import foeScoreSound from "./assets/foe-score.wav";
import youWinSound from "./assets/you-win.wav";
import youLoseSound from "./assets/you-lose.wav";
import { useEffect } from "react";

export default function Sound() {
    // set sound volume
    useEffect(() => {
        document.getElementById("you-score-sound").volume = 0.8;
        document.getElementById("foe-score-sound").volume = 0.7;
        document.getElementById("you-win-sound").volume = 0.4;
        document.getElementById("you-lose-sound").volume = 0.6;
    }, []);

    return (
        <>
            <audio volume={0.1} id="click-sound" src={clickSound} preload="auto"></audio>
            <audio id="you-score-sound" src={youScoreSound} preload="auto"></audio>
            <audio id="foe-score-sound" src={foeScoreSound} preload="auto"></audio>
            <audio id="you-win-sound" src={youWinSound} preload="auto"></audio>
            <audio id="you-lose-sound" src={youLoseSound} preload="auto"></audio>
        </>
    );
}
